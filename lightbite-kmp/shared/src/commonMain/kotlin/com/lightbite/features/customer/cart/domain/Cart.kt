package com.lightbite.shared.features.customer.cart.domain

import com.lightbite.shared.core.errors.AppResult

data class Cart(
    val items: List<CartItem>,
    val restaurantUuid: String?,
    val restaurantName: String?,
    val subtotal: Double,
    val deliveryFee: Double,
    val total: Double,
)

data class CartItem(
    val uuid: String,
    val menuItemUuid: String,
    val name: String,
    val price: Double,
    val quantity: Int,
    val imageUrl: String?,
    val specialInstructions: String?,
)

data class AddToCartRequest(
    val menuItemUuid: String,
    val restaurantUuid: String,
    val quantity: Int,
    val specialInstructions: String? = null,
)

interface CartRepository {
    suspend fun getCart(): AppResult<Cart>
    suspend fun getCachedCart(): Cart?
    suspend fun addItem(request: AddToCartRequest): AppResult<Cart>
    suspend fun updateItemQuantity(itemUuid: String, quantity: Int): AppResult<Cart>
    suspend fun removeItem(itemUuid: String): AppResult<Cart>
    suspend fun clearCart(): AppResult<Unit>
}
