package com.lightbite.shared.features.customer.order.domain

import com.lightbite.shared.core.errors.AppResult

data class CustomerOrder(
    val uuid: String,
    val restaurantName: String,
    val status: String,
    val total: Double,
    val itemCount: Int,
    val createdAt: String,
    val driverName: String?,
)

data class OrderTracking(
    val orderUuid: String,
    val status: String,
    val driverName: String?,
    val driverPhone: String?,
    val driverLocation: DriverLocation?,
    val estimatedDeliveryMin: Int?,
    val statusHistory: List<OrderStatusStep>,
)

data class DriverLocation(val lat: Double, val lng: Double)
data class OrderStatusStep(val status: String, val timestamp: String)

interface OrderRepository {
    suspend fun getOrders(page: Int = 1): AppResult<OrderListPage>
    suspend fun getCachedOrders(): OrderListPage?
    suspend fun getOrderTracking(orderUuid: String): AppResult<OrderTracking>
}

data class OrderListPage(val orders: List<CustomerOrder>, val hasMore: Boolean, val currentPage: Int)
