package com.lightbite.shared.features.customer.home.data

import com.lightbite.shared.core.api.ApiClient
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.features.customer.home.domain.SortOption

class HomeRemoteDataSource(private val apiClient: ApiClient) {
    suspend fun getRestaurants(
        page: Int,
        sort: SortOption,
        cuisine: String?,
    ): AppResult<HomeResponse> {
        val params = mutableMapOf("page" to page.toString())
        when (sort) {
            SortOption.RATING -> params["sort"] = "rating"
            SortOption.DELIVERY_TIME -> params["sort"] = "delivery_time"
            SortOption.DELIVERY_FEE -> params["sort"] = "delivery_fee"
            SortOption.DISTANCE -> params["sort"] = "distance"
        }
        cuisine?.let { params["cuisine"] = it }
        return apiClient.get("/home", params)
    }
}
