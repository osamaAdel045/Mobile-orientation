package com.lightbite.shared.features.customer.restaurant.domain

import com.lightbite.shared.core.errors.AppResult

interface RestaurantRepository {
    suspend fun getRestaurantDetail(uuid: String): AppResult<RestaurantDetail>
    suspend fun getCachedDetail(uuid: String): RestaurantDetail?
}
