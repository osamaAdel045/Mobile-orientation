package com.lightbite.shared.features.driver

import com.lightbite.shared.core.api.ApiClient
import com.lightbite.shared.core.errors.AppResult
import kotlinx.serialization.Serializable
import org.koin.dsl.module

// ═══ Domain ══════════════════════════════════════════════════════════

data class DriverJob(val orderUuid: String, val restaurantName: String, val restaurantAddress: String, val deliveryAddress: String, val distanceKm: Double, val earnings: Double, val expiresInSeconds: Int)

data class ActiveDelivery(val orderUuid: String, val phase: String, val restaurantName: String, val customerName: String, val address: String, val distanceKm: Double)

data class DriverEarnings(val today: Double, val thisWeek: Double, val totalTrips: Int, val totalEarnings: Double, val rating: Double?)

data class DriverOrder(val uuid: String, val restaurantName: String, val status: String, val earnings: Double, val completedAt: String?)

// ═══ Repositories ═════════════════════════════════════════════════════

interface DriverHomeRepository {
    suspend fun setOnline(): AppResult<Unit>
    suspend fun setOffline(): AppResult<Unit>
    suspend fun getAvailableJob(): AppResult<DriverJob?>
    suspend fun getActiveDelivery(): AppResult<ActiveDelivery?>
}

interface DriverJobRepository {
    suspend fun acceptJob(orderUuid: String): AppResult<Unit>
    suspend fun declineJob(orderUuid: String): AppResult<Unit>
}

interface DriverDeliveryRepository {
    suspend fun confirmPickup(orderUuid: String): AppResult<Unit>
    suspend fun startDelivery(orderUuid: String): AppResult<Unit>
    suspend fun confirmDelivery(orderUuid: String): AppResult<DriverEarnings?>
}

interface DriverEarningsRepository {
    suspend fun getEarnings(): AppResult<DriverEarnings>
    suspend fun getCachedEarnings(): DriverEarnings?
}

interface DriverHistoryRepository {
    suspend fun getOrders(page: Int = 1): AppResult<List<DriverOrder>>
}

// ═══ DTOs + DataSources ══════════════════════════════════════════════

@Serializable data class DriverJobDto(val order_uuid: String, val restaurant_name: String, val restaurant_address: String, val delivery_address: String, val distance_km: Double, val earnings: Double, val expires_in_seconds: Int)
@Serializable data class ActiveDeliveryDto(val order_uuid: String, val phase: String, val restaurant_name: String, val customer_name: String, val address: String, val distance_km: Double)
@Serializable data class DriverEarningsDto(val today: Double, val this_week: Double, val total_trips: Int, val total_earnings: Double, val rating: Double?)
@Serializable data class DriverOrderDto(val uuid: String, val restaurant_name: String, val status: String, val earnings: Double, val completed_at: String?)

class DriverRemoteDataSource(private val api: ApiClient) {
    suspend fun setOnline(): AppResult<Unit> = api.postEmpty("/driver/online")
    suspend fun setOffline(): AppResult<Unit> = api.postEmpty("/driver/offline")
    suspend fun getAvailableJob(): AppResult<DriverJobDto?> = api.get("/driver/jobs/available")
    suspend fun getActiveDelivery(): AppResult<ActiveDeliveryDto?> = api.get("/driver/active-delivery")
    suspend fun acceptJob(uuid: String): AppResult<Unit> = api.postEmpty("/driver/jobs/$uuid/accept")
    suspend fun declineJob(uuid: String): AppResult<Unit> = api.postEmpty("/driver/jobs/$uuid/decline")
    suspend fun confirmPickup(uuid: String): AppResult<Unit> = api.postEmpty("/driver/orders/$uuid/pickup")
    suspend fun startDelivery(uuid: String): AppResult<Unit> = api.postEmpty("/driver/orders/$uuid/start-delivery")
    suspend fun confirmDelivery(uuid: String): AppResult<DriverEarningsDto?> = api.get("/driver/orders/$uuid/deliver")
    suspend fun getEarnings(): AppResult<DriverEarningsDto> = api.get("/driver/earnings")
    suspend fun getOrders(page: Int): AppResult<List<DriverOrderDto>> = api.get("/driver/orders", mapOf("page" to page.toString()))
}

// ═══ Repository Impls ═════════════════════════════════════════════════

class DriverHomeRepositoryImpl(private val remote: DriverRemoteDataSource) : DriverHomeRepository {
    override suspend fun setOnline() = remote.setOnline()
    override suspend fun setOffline() = remote.setOffline()
    override suspend fun getAvailableJob() = remote.getAvailableJob().map { it?.let { DriverJob(it.order_uuid, it.restaurant_name, it.restaurant_address, it.delivery_address, it.distance_km, it.earnings, it.expires_in_seconds) } }
    override suspend fun getActiveDelivery() = remote.getActiveDelivery().map { it?.let { ActiveDelivery(it.order_uuid, it.phase, it.restaurant_name, it.customer_name, it.address, it.distance_km) } }
}

class DriverJobRepositoryImpl(private val remote: DriverRemoteDataSource) : DriverJobRepository {
    override suspend fun acceptJob(orderUuid: String) = remote.acceptJob(orderUuid)
    override suspend fun declineJob(orderUuid: String) = remote.declineJob(orderUuid)
}

class DriverDeliveryRepositoryImpl(private val remote: DriverRemoteDataSource) : DriverDeliveryRepository {
    override suspend fun confirmPickup(orderUuid: String) = remote.confirmPickup(orderUuid)
    override suspend fun startDelivery(orderUuid: String) = remote.startDelivery(orderUuid)
    override suspend fun confirmDelivery(orderUuid: String) = remote.confirmDelivery(orderUuid).map { it?.let { DriverEarnings(it.today, it.this_week, it.total_trips, it.total_earnings, it.rating) } }
}

class DriverEarningsRepositoryImpl(private val remote: DriverRemoteDataSource) : DriverEarningsRepository {
    private var cached: DriverEarnings? = null
    override suspend fun getEarnings(): AppResult<DriverEarnings> {
        val result = remote.getEarnings()
        if (result is AppResult.Success) cached = DriverEarnings(result.data.today, result.data.this_week, result.data.total_trips, result.data.total_earnings, result.data.rating)
        return result.map { DriverEarnings(it.today, it.this_week, it.total_trips, it.total_earnings, it.rating) }
    }
    override suspend fun getCachedEarnings(): DriverEarnings? = cached
}

class DriverHistoryRepositoryImpl(private val remote: DriverRemoteDataSource) : DriverHistoryRepository {
    override suspend fun getOrders(page: Int): AppResult<List<DriverOrder>> =
        remote.getOrders(page).map { list -> list.map { DriverOrder(it.uuid, it.restaurant_name, it.status, it.earnings, it.completed_at) } }
}

val driverSharedModules = listOf(module {
    single<DriverRemoteDataSource> { DriverRemoteDataSource(get()) }
    single<DriverHomeRepository> { DriverHomeRepositoryImpl(get()) }
    single<DriverJobRepository> { DriverJobRepositoryImpl(get()) }
    single<DriverDeliveryRepository> { DriverDeliveryRepositoryImpl(get()) }
    single<DriverEarningsRepository> { DriverEarningsRepositoryImpl(get()) }
    single<DriverHistoryRepository> { DriverHistoryRepositoryImpl(get()) }
})
