package com.lightbite.shared.features.customer.rate_order.data

import com.lightbite.shared.core.api.ApiClient
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.features.customer.rate_order.domain.RateOrderRepository
import kotlinx.serialization.Serializable

class RateOrderRemoteDataSource(private val apiClient: ApiClient) {
    suspend fun submitRating(request: RateOrderRequest): AppResult<Unit> = apiClient.post("/orders/${request.order_uuid}/rate", request)
}

@Serializable data class RateOrderRequest(val rating: Int, val comment: String? = null, val order_uuid: String = "")

class RateOrderRepositoryImpl(private val remote: RateOrderRemoteDataSource, private val apiClient: ApiClient) : RateOrderRepository {
    override suspend fun submitRating(orderUuid: String, rating: Int, comment: String?) =
        remote.submitRating(RateOrderRequest(rating, comment, orderUuid))
}
