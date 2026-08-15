package com.lightbite.shared.features.customer.restaurant.data

import com.lightbite.shared.features.customer.restaurant.domain.MenuItem
import com.lightbite.shared.features.customer.restaurant.domain.RestaurantDetail
import kotlinx.serialization.Serializable

@Serializable
data class RestaurantDetailResponse(
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
    val address: String? = null,
    val phone: String? = null,
    val menu: List<MenuItemDto> = emptyList(),
)

@Serializable
data class MenuItemDto(
    val uuid: String,
    val name: String,
    val description: String? = null,
    val price: Double,
    val image_url: String? = null,
    val is_available: Boolean,
    val category: String? = null,
)

fun RestaurantDetailResponse.toDomain(): RestaurantDetail = RestaurantDetail(
    uuid = uuid, name = name, cuisine = cuisine, rating = rating,
    deliveryTimeMin = delivery_time_min, deliveryFee = delivery_fee,
    minimumOrder = minimum_order, imageUrl = image_url, isOpen = is_open,
    distanceKm = distance_km, address = address, phone = phone,
    menu = menu.map { it.toDomain() },
)

fun MenuItemDto.toDomain(): MenuItem = MenuItem(
    uuid = uuid, name = name, description = description, price = price,
    imageUrl = image_url, isAvailable = is_available, category = category,
)
