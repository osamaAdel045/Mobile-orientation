package com.lightbite.shared.features.customer.restaurant.data

import com.lightbite.shared.core.api.ApiClient
import com.lightbite.shared.core.errors.AppResult

class RestaurantRemoteDataSource(private val apiClient: ApiClient) {
    suspend fun getRestaurantDetail(uuid: String): AppResult<RestaurantDetailResponse> =
        apiClient.get("/restaurants/$uuid")
}
