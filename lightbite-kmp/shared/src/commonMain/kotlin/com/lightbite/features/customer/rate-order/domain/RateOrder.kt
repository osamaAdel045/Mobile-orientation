package com.lightbite.shared.features.customer.rate_order.domain

import com.lightbite.shared.core.errors.AppResult

data class Rating(val orderUuid: String, val rating: Int, val comment: String?)

interface RateOrderRepository {
    suspend fun submitRating(orderUuid: String, rating: Int, comment: String?): AppResult<Unit>
}
