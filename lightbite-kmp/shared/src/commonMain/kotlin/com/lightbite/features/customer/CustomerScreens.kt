package com.lightbite.app.features.customer

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.lightbite.app.core.theme.LightBiteTheme
import com.lightbite.app.core.ui.*
import com.lightbite.shared.core.errors.ScreenState
import com.lightbite.shared.features.customer.cart.domain.Cart
import com.lightbite.shared.features.customer.cart.domain.CartItem
import com.lightbite.shared.features.customer.order.domain.CustomerOrder
import com.lightbite.shared.features.customer.order.domain.OrderTracking
import androidx.compose.material3.TextButton
import androidx.compose.ui.Alignment
import org.koin.compose.koinInject

// ── Cart Screen ──────────────────────────────────────────────────

@Composable
fun CartScreen(
    onCheckout: () -> Unit,
    onBack: () -> Unit,
    viewModel: CartViewModel = koinInject(),
) {
    val screenState by viewModel.screenState.collectAsState()

    Column(modifier = Modifier.fillMaxSize()) {
        LBScreenHeader(title = "Cart", onBack = onBack)

        when (val state = screenState) {
            is ScreenState.Loading -> Column(Modifier.padding(LightBiteTheme.spacing.md)) { repeat(4) { LBSkeleton(height = LightBiteTheme.spacing.lg * 3) } }
            is ScreenState.Loaded -> CartContent(state.data, onCheckout, viewModel::removeItem, viewModel::updateQuantity)
            is ScreenState.Empty -> LBEmptyState(title = "Your cart is empty", subtitle = "Browse restaurants and add items")
            is ScreenState.Error -> LBErrorDisplay(message = state.message, onRetry = viewModel::load)
        }
    }
}

@Composable
private fun CartContent(cart: Cart, onCheckout: () -> Unit, onRemove: (String) -> Unit, onUpdateQty: (String, Int) -> Unit) {
    LazyColumn(contentPadding = PaddingValues(LightBiteTheme.spacing.md), verticalArrangement = Arrangement.spacedBy(LightBiteTheme.spacing.sm)) {
        if (cart.restaurantName != null) item { Text("From ${cart.restaurantName}", style = LightBiteTheme.typography.bodySmall) }
        items(cart.items, key = { it.uuid }) { item -> CartItemRow(item, onRemove, onUpdateQty) }
        item {
            Row(Modifier.fillMaxWidth().padding(vertical = LightBiteTheme.spacing.md), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Total: SAR ${cart.total}", style = LightBiteTheme.typography.heading3)
            }
            LBButton(text = "Checkout", onClick = onCheckout)
        }
    }
}

@Composable
private fun CartItemRow(item: CartItem, onRemove: (String) -> Unit, onUpdateQty: (String, Int) -> Unit) {
    LBCard {
        Row(Modifier.padding(LightBiteTheme.spacing.md)) {
            Column(Modifier.weight(1f)) {
                Text(item.name, style = LightBiteTheme.typography.body)
                Text("SAR ${item.price} × ${item.quantity}", style = LightBiteTheme.typography.bodySmall, color = LightBiteTheme.colors.neutral.`400`)
            }
            // Qty stepper
            Row(verticalAlignment = Alignment.CenterVertically) {
                TextButton(onClick = { if (item.quantity > 1) onUpdateQty(item.uuid, item.quantity - 1) }) { Text("-") }
                Text("${item.quantity}")
                TextButton(onClick = { onUpdateQty(item.uuid, item.quantity + 1) }) { Text("+") }
            }
        }
    }
}

// ── Checkout Screen ──────────────────────────────────────────────

@Composable
fun CheckoutScreen(
    onOrderPlaced: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: CheckoutViewModel = koinInject(),
) {
    val state by viewModel.screenState.collectAsState()

    LaunchedEffect(state.orderResult) { state.orderResult?.let { onOrderPlaced(it.orderUuid) } }

    Column(modifier = Modifier.fillMaxSize()) {
        LBScreenHeader(title = "Checkout", onBack = onBack)

        if (state.error != null) LBErrorDisplay(message = state.error!!)

        Column(Modifier.padding(LightBiteTheme.spacing.md)) {
            // Simplified — real implementation would show addresses, cart summary
            Text("Select delivery address", style = LightBiteTheme.typography.heading3)
            Spacer(Modifier.height(LightBiteTheme.spacing.lg))
            LBInput(value = state.notes, onValueChange = viewModel::setNotes, label = "Order notes (optional)", multiline = true)
            Spacer(Modifier.height(LightBiteTheme.spacing.lg))
            LBButton(text = "Place Order — Cash on Delivery", onClick = viewModel::placeOrder, loading = state.isPlacing)
        }
    }
}

// ── Order List Screen ────────────────────────────────────────────

@Composable
fun OrderListScreen(
    onOrderClick: (String) -> Unit,
    viewModel: OrderListViewModel = koinInject(),
) {
    val screenState by viewModel.screenState.collectAsState()

    Column(Modifier.fillMaxSize()) {
        LBScreenHeader(title = "My Orders")
        when (val state = screenState) {
            is ScreenState.Loading -> Column(Modifier.padding(LightBiteTheme.spacing.md)) { repeat(5) { LBSkeleton(height = LightBiteTheme.spacing.lg * 2) } }
            is ScreenState.Loaded -> LazyColumn(contentPadding = PaddingValues(LightBiteTheme.spacing.md), verticalArrangement = Arrangement.spacedBy(LightBiteTheme.spacing.sm)) {
                items(state.data, key = { it.uuid }) { order ->
                    LBCard(onClick = { onOrderClick(order.uuid) }) {
                        Row(Modifier.padding(LightBiteTheme.spacing.md)) {
                            Column(Modifier.weight(1f)) {
                                Text(order.restaurantName, style = LightBiteTheme.typography.heading3)
                                Text("SAR ${order.total} · ${order.itemCount} items", style = LightBiteTheme.typography.bodySmall)
                                LBStatusBadge(status = order.status)
                            }
                        }
                    }
                }
            }
            is ScreenState.Empty -> LBEmptyState(title = "No orders yet")
            is ScreenState.Error -> LBErrorDisplay(message = state.message, onRetry = viewModel::load)
        }
    }
}

// ── Order Tracking Screen ────────────────────────────────────────

@Composable
fun OrderTrackingScreen(
    orderUuid: String,
    onBack: () -> Unit,
    viewModel: OrderTrackingViewModel = koinInject(),
) {
    LaunchedEffect(orderUuid) { viewModel.load(orderUuid) }
    val screenState by viewModel.screenState.collectAsState()

    Column(Modifier.fillMaxSize()) {
        LBScreenHeader(title = "Track Order", onBack = onBack)
        when (val state = screenState) {
            is ScreenState.Loading -> Column(Modifier.padding(LightBiteTheme.spacing.md)) { repeat(3) { LBSkeleton(height = LightBiteTheme.spacing.lg * 2) } }
            is ScreenState.Loaded -> TrackingContent(state.data)
            is ScreenState.Error -> LBErrorDisplay(message = state.message)
            is ScreenState.Empty -> LBEmptyState(title = "Order not found")
        }
    }
}

@Composable
private fun TrackingContent(tracking: OrderTracking) {
    Column(Modifier.padding(LightBiteTheme.spacing.md)) {
        LBStatusBadge(status = tracking.status)
        Spacer(Modifier.height(LightBiteTheme.spacing.md))
        tracking.driverName?.let { Text("Driver: $it", style = LightBiteTheme.typography.body) }
        tracking.estimatedDeliveryMin?.let { Text("Estimated: $it min", style = LightBiteTheme.typography.bodySmall) }
        Spacer(Modifier.height(LightBiteTheme.spacing.lg))
        Text("Status History", style = LightBiteTheme.typography.heading3)
        tracking.statusHistory.forEach { step ->
            Text("${step.status} — ${step.timestamp}", style = LightBiteTheme.typography.bodySmall, color = LightBiteTheme.colors.neutral.`400`)
        }
    }
}
