package com.lightbite.shared.features.customer.checkout.data

import com.lightbite.shared.core.api.ApiClient
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.features.customer.checkout.domain.*
import kotlinx.serialization.Serializable

class CheckoutRemoteDataSource(private val apiClient: ApiClient) {
    suspend fun placeOrder(request: PlaceOrderRequestDto): AppResult<OrderResultDto> =
        apiClient.post("/orders", request)
}

@Serializable data class PlaceOrderRequestDto(val address_uuid: String, val payment_method: String, val notes: String? = null)
@Serializable data class OrderResultDto(val order_uuid: String, val message: String)

class CheckoutRepositoryImpl(private val remote: CheckoutRemoteDataSource) : CheckoutRepository {
    override suspend fun placeOrder(request: PlaceOrderRequest): AppResult<OrderResult> =
        remote.placeOrder(PlaceOrderRequestDto(request.addressUuid, request.paymentMethod.name.lowercase(), request.notes))
            .map { OrderResult(it.order_uuid, it.message) }
}
