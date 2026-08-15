package com.lightbite.shared.features.customer.order.data

import com.lightbite.shared.core.api.ApiClient
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.features.customer.order.domain.*
import kotlinx.serialization.Serializable

class OrderRemoteDataSource(private val apiClient: ApiClient) {
    suspend fun getOrders(page: Int): AppResult<OrderListResponse> = apiClient.get("/orders", mapOf("page" to page.toString()))
    suspend fun getOrderTracking(uuid: String): AppResult<OrderTrackingResponse> = apiClient.get("/orders/$uuid/tracking")
}

@Serializable data class OrderListResponse(val orders: List<OrderDto>, val has_more: Boolean, val current_page: Int)
@Serializable data class OrderDto(val uuid: String, val restaurant_name: String, val status: String, val total: Double, val item_count: Int, val created_at: String, val driver_name: String? = null)
@Serializable data class OrderTrackingResponse(val order_uuid: String, val status: String, val driver_name: String?, val driver_phone: String?, val driver_location: DriverLocationDto?, val estimated_delivery_min: Int?, val status_history: List<OrderStatusStepDto>)
@Serializable data class DriverLocationDto(val lat: Double, val lng: Double)
@Serializable data class OrderStatusStepDto(val status: String, val timestamp: String)

fun OrderDto.toDomain() = CustomerOrder(uuid, restaurant_name, status, total, item_count, created_at, driver_name)
fun OrderTrackingResponse.toDomain() = OrderTracking(order_uuid, status, driver_name, driver_phone, driver_location?.let { DriverLocation(it.lat, it.lng) }, estimated_delivery_min, status_history.map { OrderStatusStep(it.status, it.timestamp) })

class OrderRepositoryImpl(private val remote: OrderRemoteDataSource) : OrderRepository {
    private var cached: OrderListPage? = null
    override suspend fun getOrders(page: Int): AppResult<OrderListPage> {
        val result = remote.getOrders(page)
        if (result is AppResult.Success) cached = OrderListPage(result.data.orders.map { it.toDomain() }, result.data.has_more, result.data.current_page)
        return result.map { OrderListPage(it.orders.map { o -> o.toDomain() }, it.has_more, it.current_page) }
    }
    override suspend fun getCachedOrders(): OrderListPage? = cached
    override suspend fun getOrderTracking(orderUuid: String): AppResult<OrderTracking> = remote.getOrderTracking(orderUuid).map { it.toDomain() }
}
