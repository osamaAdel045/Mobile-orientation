package com.lightbite.shared.features.customer.checkout.domain

import com.lightbite.shared.core.errors.AppResult

data class OrderResult(val orderUuid: String, val message: String)

data class PlaceOrderRequest(
    val addressUuid: String,
    val paymentMethod: PaymentMethod,
    val notes: String? = null,
)

enum class PaymentMethod { CASH }

interface CheckoutRepository {
    suspend fun placeOrder(request: PlaceOrderRequest): AppResult<OrderResult>
}
