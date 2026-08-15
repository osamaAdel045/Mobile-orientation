package com.lightbite.shared.features.customer.home.domain

import com.lightbite.shared.core.errors.AppResult

interface HomeRepository {
    suspend fun getRestaurants(
        page: Int = 1,
        sort: SortOption = SortOption.RATING,
        cuisine: String? = null,
    ): AppResult<RestaurantListPage>

    suspend fun getCachedRestaurants(): RestaurantListPage?
}

data class RestaurantListPage(
    val restaurants: List<Restaurant>,
    val total: Int,
    val currentPage: Int,
    val hasMore: Boolean,
)
