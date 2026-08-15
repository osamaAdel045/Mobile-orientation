package com.lightbite.shared.features.customer.restaurant.data

import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.features.customer.restaurant.domain.RestaurantDetail
import com.lightbite.shared.features.customer.restaurant.domain.RestaurantRepository

class RestaurantRepositoryImpl(
    private val remote: RestaurantRemoteDataSource,
) : RestaurantRepository {
    private val cache = mutableMapOf<String, RestaurantDetail>()

    override suspend fun getRestaurantDetail(uuid: String): AppResult<RestaurantDetail> {
        val result = remote.getRestaurantDetail(uuid)
        if (result is AppResult.Success) {
            cache[uuid] = result.data.toDomain()
        }
        return result.map { it.toDomain() }
    }

    override suspend fun getCachedDetail(uuid: String): RestaurantDetail? = cache[uuid]
}
