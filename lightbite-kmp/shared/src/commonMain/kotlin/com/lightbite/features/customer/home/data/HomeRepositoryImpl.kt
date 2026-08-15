package com.lightbite.shared.features.customer.home.data

import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.features.customer.home.domain.HomeRepository
import com.lightbite.shared.features.customer.home.domain.RestaurantListPage
import com.lightbite.shared.features.customer.home.domain.SortOption

class HomeRepositoryImpl(
    private val remote: HomeRemoteDataSource,
) : HomeRepository {
    private var cached: RestaurantListPage? = null

    override suspend fun getRestaurants(
        page: Int,
        sort: SortOption,
        cuisine: String?,
    ): AppResult<RestaurantListPage> {
        val result = remote.getRestaurants(page, sort, cuisine)
        if (result is AppResult.Success) {
            cached = result.data.toDomain()
        }
        return result.map { it.toDomain() }
    }

    override suspend fun getCachedRestaurants(): RestaurantListPage? = cached
}
