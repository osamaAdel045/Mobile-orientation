package com.lightbite.shared.features.customer.home.data

import com.lightbite.shared.features.customer.home.domain.Restaurant
import com.lightbite.shared.features.customer.home.domain.RestaurantListPage
import kotlinx.serialization.Serializable

@Serializable
data class HomeResponse(
    val restaurants: List<RestaurantDto>,
    val total: Int,
    val current_page: Int,
    val has_more: Boolean,
)

@Serializable
data class RestaurantDto(
    val uuid: String,
    val name: String,
    val cuisine: String,
    val rating: Double,
    val delivery_time_min: Int,
    val delivery_fee: Double,
    val minimum_order: Double,
    val image_url: String? = null,
    val is_open: Boolean,
    val distance_km: Double? = null,
)

fun HomeResponse.toDomain(): RestaurantListPage = RestaurantListPage(
    restaurants = restaurants.map { it.toDomain() },
    total = total,
    currentPage = current_page,
    hasMore = has_more,
)

fun RestaurantDto.toDomain(): Restaurant = Restaurant(
    uuid = uuid,
    name = name,
    cuisine = cuisine,
    rating = rating,
    deliveryTimeMin = delivery_time_min,
    deliveryFee = delivery_fee,
    minimumOrder = minimum_order,
    imageUrl = image_url,
    isOpen = is_open,
    distanceKm = distance_km,
)
