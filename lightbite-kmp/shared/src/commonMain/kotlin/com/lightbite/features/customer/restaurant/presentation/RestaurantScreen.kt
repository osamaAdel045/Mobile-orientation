package com.lightbite.app.features.customer.restaurant.presentation

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
import com.lightbite.shared.features.customer.restaurant.domain.MenuItem
import com.lightbite.shared.features.customer.restaurant.domain.RestaurantDetail
import org.koin.compose.koinInject

@Composable
fun RestaurantScreen(
    restaurantUuid: String,
    onBack: () -> Unit,
    onMenuItemClick: (MenuItem) -> Unit,
    viewModel: RestaurantViewModel = koinInject(),
) {
    LaunchedEffect(restaurantUuid) { viewModel.load(restaurantUuid) }
    val screenState by viewModel.screenState.collectAsState()

    Column(modifier = Modifier.fillMaxSize()) {
        LBScreenHeader(title = "Restaurant", onBack = onBack)

        when (val state = screenState) {
            is ScreenState.Loading -> Column(modifier = Modifier.padding(LightBiteTheme.spacing.md)) {
                LBSkeleton(height = LightBiteTheme.spacing.xxl * 3)
                repeat(5) { LBSkeleton(height = LightBiteTheme.spacing.lg * 3) }
            }
            is ScreenState.Loaded -> RestaurantContent(state.data, onMenuItemClick)
            is ScreenState.Empty -> LBEmptyState(title = "Menu unavailable")
            is ScreenState.Error -> LBErrorDisplay(message = state.message, onRetry = { viewModel.load(restaurantUuid) })
        }
    }
}

@Composable
private fun RestaurantContent(data: RestaurantDetail, onMenuItemClick: (MenuItem) -> Unit) {
    LazyColumn(
        contentPadding = PaddingValues(LightBiteTheme.spacing.md),
        verticalArrangement = Arrangement.spacedBy(LightBiteTheme.spacing.md),
    ) {
        // Header
        item {
            Text(data.name, style = LightBiteTheme.typography.heading1)
            Text("${data.cuisine} · ⭐ ${data.rating} · ${data.deliveryTimeMin} min",
                style = LightBiteTheme.typography.bodySmall, color = LightBiteTheme.colors.neutral.`400`)
            Text(if (data.isOpen) "Open" else "Closed",
                color = if (data.isOpen) LightBiteTheme.colors.semantic.success else LightBiteTheme.colors.semantic.error,
                style = LightBiteTheme.typography.caption)
        }

        // Menu items
        items(data.menu, key = { it.uuid }) { item ->
            if (item.isAvailable) {
                LBCard(onClick = { onMenuItemClick(item) }) {
                    Row(modifier = Modifier.padding(LightBiteTheme.spacing.md)) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(item.name, style = LightBiteTheme.typography.heading3)
                            item.description?.let { Text(it, style = LightBiteTheme.typography.bodySmall, color = LightBiteTheme.colors.neutral.`400`) }
                            Text("SAR ${item.price}", style = LightBiteTheme.typography.body, color = LightBiteTheme.colors.primary.`500`)
                        }
                    }
                }
            }
        }
    }
}
