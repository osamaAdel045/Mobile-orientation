package com.lightbite.shared.features.customer.home.domain

import kotlinx.serialization.Serializable

@Serializable
data class Restaurant(
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
)

enum class SortOption { RATING, DELIVERY_TIME, DELIVERY_FEE, DISTANCE }
