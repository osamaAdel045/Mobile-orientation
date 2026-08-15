package com.lightbite.app.features.customer

import com.lightbite.app.core.viewmodel.ViewModel
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.core.errors.ScreenState
import com.lightbite.shared.features.customer.cart.domain.*
import com.lightbite.shared.features.customer.checkout.domain.*
import com.lightbite.shared.features.customer.order.domain.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// ── Cart ViewModel ──────────────────────────────────────────────────

class CartViewModel(private val repo: CartRepository) : ViewModel() {
    private val _screenState = MutableStateFlow<ScreenState<Cart>>(ScreenState.Loading)
    val screenState: StateFlow<ScreenState<Cart>> = _screenState.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _screenState.value = ScreenState.Loading
            repo.getCachedCart()?.let { cart ->
                _screenState.value = if (cart.items.isEmpty()) ScreenState.Empty else ScreenState.Loaded(cart)
            }
            repo.getCart().let { result ->
                when (result) {
                    is AppResult.Success -> _screenState.value =
                        if (result.data.items.isEmpty()) ScreenState.Empty else ScreenState.Loaded(result.data)
                    is AppResult.Failure -> {
                        if (_screenState.value !is ScreenState.Loaded)
                            _screenState.value = ScreenState.Error(result.error.message)
                    }
                }
            }
        }
    }

    fun removeItem(uuid: String) {
        viewModelScope.launch {
            repo.removeItem(uuid).let { result ->
                when (result) {
                    is AppResult.Success -> _screenState.value =
                        if (result.data.items.isEmpty()) ScreenState.Empty else ScreenState.Loaded(result.data)
                    is AppResult.Failure -> {} // Keep last-good state
                }
            }
        }
    }

    fun updateQuantity(uuid: String, qty: Int) {
        viewModelScope.launch {
            repo.updateItemQuantity(uuid, qty).let { result ->
                if (result is AppResult.Success) _screenState.value =
                    if (result.data.items.isEmpty()) ScreenState.Empty else ScreenState.Loaded(result.data)
            }
        }
    }
}

// ── Checkout ViewModel ──────────────────────────────────────────────

class CheckoutViewModel(private val repo: CheckoutRepository) : ViewModel() {
    private val _screenState = MutableStateFlow<CheckoutUiState>(CheckoutUiState())
    val screenState: StateFlow<CheckoutUiState> = _screenState.asStateFlow()

    fun selectAddress(uuid: String) { _screenState.value = _screenState.value.copy(selectedAddressUuid = uuid) }
    fun setNotes(notes: String) { _screenState.value = _screenState.value.copy(notes = notes) }

    fun placeOrder() {
        val s = _screenState.value
        if (s.selectedAddressUuid == null) { _screenState.value = s.copy(error = "Select an address"); return }
        viewModelScope.launch {
            _screenState.value = s.copy(isPlacing = true, error = null)
            repo.placeOrder(PlaceOrderRequest(s.selectedAddressUuid, PaymentMethod.CASH, s.notes)).let { result ->
                when (result) {
                    is AppResult.Success -> _screenState.value = _screenState.value.copy(isPlacing = false, orderResult = result.data)
                    is AppResult.Failure -> _screenState.value = _screenState.value.copy(isPlacing = false, error = result.error.message)
                }
            }
        }
    }
}

data class CheckoutUiState(
    val selectedAddressUuid: String? = null,
    val notes: String = "",
    val isPlacing: Boolean = false,
    val error: String? = null,
    val orderResult: OrderResult? = null,
)

// ── Order ViewModels ────────────────────────────────────────────────

class OrderListViewModel(private val repo: OrderRepository) : ViewModel() {
    private val _screenState = MutableStateFlow<ScreenState<List<CustomerOrder>>>(ScreenState.Loading)
    val screenState: StateFlow<ScreenState<List<CustomerOrder>>> = _screenState.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _screenState.value = ScreenState.Loading
            repo.getCachedOrders()?.let { page ->
                _screenState.value = if (page.orders.isEmpty()) ScreenState.Empty else ScreenState.Loaded(page.orders)
            }
            repo.getOrders().let { result ->
                when (result) {
                    is AppResult.Success -> _screenState.value =
                        if (result.data.orders.isEmpty()) ScreenState.Empty else ScreenState.Loaded(result.data.orders)
                    is AppResult.Failure -> {
                        if (_screenState.value !is ScreenState.Loaded)
                            _screenState.value = ScreenState.Error(result.error.message)
                    }
                }
            }
        }
    }
}

class OrderTrackingViewModel(private val repo: OrderRepository) : ViewModel() {
    private val _screenState = MutableStateFlow<ScreenState<OrderTracking>>(ScreenState.Loading)
    val screenState: StateFlow<ScreenState<OrderTracking>> = _screenState.asStateFlow()

    fun load(uuid: String) {
        viewModelScope.launch {
            _screenState.value = ScreenState.Loading
            repo.getOrderTracking(uuid).let { result ->
                when (result) {
                    is AppResult.Success -> _screenState.value = ScreenState.Loaded(result.data)
                    is AppResult.Failure -> _screenState.value = ScreenState.Error(result.error.message)
                }
            }
        }
    }
}
