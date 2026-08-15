package com.lightbite.shared.features.customer.restaurant.domain

import kotlinx.serialization.Serializable

@Serializable
data class RestaurantDetail(
    val uuid: String,
    val name: String,
    val cuisine: String,
    val rating: Double,
    val deliveryTimeMin: Int,
    val deliveryFee: Double,
    val minimumOrder: Double,
    val imageUrl: String?,
    val isOpen: Boolean,
    val distanceKm: Double?,
    val address: String?,
    val phone: String?,
    val menu: List<MenuItem>,
)

@Serializable
data class MenuItem(
    val uuid: String,
    val name: String,
    val description: String?,
    val price: Double,
    val imageUrl: String?,
    val isAvailable: Boolean,
    val category: String?,
)

data class MenuItemWithQuantity(
    val item: MenuItem,
    val quantity: Int,
    val specialInstructions: String = "",
)
