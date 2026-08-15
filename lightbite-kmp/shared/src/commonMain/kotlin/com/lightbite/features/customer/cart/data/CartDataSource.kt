package com.lightbite.shared.features.customer.cart.data

import com.lightbite.shared.core.api.ApiClient
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.features.customer.cart.domain.*
import kotlinx.serialization.Serializable

class CartRemoteDataSource(private val apiClient: ApiClient) {
    suspend fun getCart(): AppResult<CartResponse> = apiClient.get("/cart")
    suspend fun addItem(request: AddToCartRequestDto): AppResult<CartResponse> = apiClient.post("/cart/items", request)
    suspend fun updateItem(itemUuid: String, quantity: Int): AppResult<CartResponse> =
        apiClient.patch("/cart/items/$itemUuid", UpdateCartItemRequest(quantity))
    suspend fun removeItem(itemUuid: String): AppResult<CartResponse> = apiClient.delete("/cart/items/$itemUuid")
    suspend fun clearCart(): AppResult<Unit> = apiClient.postEmpty("/cart/clear")
}

@Serializable data class CartResponse(val items: List<CartItemDto>, val restaurant_uuid: String?, val restaurant_name: String?, val subtotal: Double, val delivery_fee: Double, val total: Double)
@Serializable data class CartItemDto(val uuid: String, val menu_item_uuid: String, val name: String, val price: Double, val quantity: Int, val image_url: String?, val special_instructions: String?)
@Serializable data class AddToCartRequestDto(val menu_item_uuid: String, val restaurant_uuid: String, val quantity: Int, val special_instructions: String? = null)
@Serializable data class UpdateCartItemRequest(val quantity: Int)

fun CartResponse.toDomain() = Cart(
    items = items.map { CartItem(it.uuid, it.menu_item_uuid, it.name, it.price, it.quantity, it.image_url, it.special_instructions) },
    restaurantUuid = restaurant_uuid, restaurantName = restaurant_name,
    subtotal = subtotal, deliveryFee = delivery_fee, total = total,
)

class CartRepositoryImpl(
    private val remote: CartRemoteDataSource,
) : CartRepository {
    private var cached: Cart? = null

    override suspend fun getCart(): AppResult<Cart> {
        val result = remote.getCart()
        if (result is AppResult.Success) cached = result.data.toDomain()
        return result.map { it.toDomain() }
    }

    override suspend fun getCachedCart(): Cart? = cached
    override suspend fun addItem(request: AddToCartRequest) = remote.addItem(AddToCartRequestDto(request.menuItemUuid, request.restaurantUuid, request.quantity, request.specialInstructions)).let { r -> if (r is AppResult.Success) cached = r.data.toDomain(); r.map { it.toDomain() } }
    override suspend fun updateItemQuantity(itemUuid: String, quantity: Int) = remote.updateItem(itemUuid, quantity).let { r -> if (r is AppResult.Success) cached = r.data.toDomain(); r.map { it.toDomain() } }
    override suspend fun removeItem(itemUuid: String) = remote.removeItem(itemUuid).let { r -> if (r is AppResult.Success) cached = r.data.toDomain(); r.map { it.toDomain() } }
    override suspend fun clearCart() = remote.clearCart().also { cached = null }
}
