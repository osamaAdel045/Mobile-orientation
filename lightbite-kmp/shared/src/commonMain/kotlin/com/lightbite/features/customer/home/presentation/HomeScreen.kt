package com.lightbite.app.features.customer.home.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.lightbite.app.core.theme.LightBiteTheme
import com.lightbite.app.core.ui.*
import com.lightbite.shared.core.errors.ScreenState
import com.lightbite.shared.features.customer.home.domain.Restaurant
import com.lightbite.shared.features.customer.home.domain.SortOption
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.TextButton
import androidx.compose.ui.Alignment
import org.koin.compose.koinInject

@Composable
fun HomeScreen(
    onRestaurantClick: (String) -> Unit,
    onSearchClick: () -> Unit,
    viewModel: HomeViewModel = koinInject(),
) {
    val screenState by viewModel.screenState.collectAsState()
    val listState = rememberLazyListState()

    // Infinite scroll trigger
    val shouldLoadMore by remember {
        derivedStateOf {
            val lastVisible = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            val totalItems = listState.layoutInfo.totalItemsCount
            lastVisible >= totalItems - 3 && totalItems > 0
        }
    }
    if (shouldLoadMore) viewModel.loadMore()

    Column(modifier = Modifier.fillMaxSize()) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(LightBiteTheme.spacing.md),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text("LightBite", style = LightBiteTheme.typography.heading1, color = LightBiteTheme.colors.primary.`500`)
            TextButton(onClick = onSearchClick) { Text("🔍", style = LightBiteTheme.typography.heading2) }
        }

        // Cuisine filter chips
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = LightBiteTheme.spacing.md),
            horizontalArrangement = Arrangement.spacedBy(LightBiteTheme.spacing.sm),
        ) {
            items(CUISINE_OPTIONS) { cuisine ->
                // Simplified chip — real implementation uses FilterChip
                Text(
                    text = cuisine,
                    modifier = Modifier.padding(vertical = LightBiteTheme.spacing.xs, horizontal = LightBiteTheme.spacing.sm),
                    style = LightBiteTheme.typography.bodySmall,
                    color = LightBiteTheme.colors.neutral.`600`,
                )
            }
        }

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.sm))

        // Content
        when (val state = screenState) {
            is ScreenState.Loading -> Column(modifier = Modifier.padding(LightBiteTheme.spacing.md)) {
                repeat(5) { LBSkeleton(height = LightBiteTheme.spacing.lg * 3) }
            }
            is ScreenState.Loaded -> LazyColumn(
                state = listState,
                contentPadding = PaddingValues(horizontal = LightBiteTheme.spacing.md, vertical = LightBiteTheme.spacing.sm),
                verticalArrangement = Arrangement.spacedBy(LightBiteTheme.spacing.md),
            ) {
                items(state.data.restaurants, key = { it.uuid }) { restaurant ->
                    RestaurantCard(restaurant = restaurant) { onRestaurantClick(restaurant.uuid) }
                }
                if (state.data.isLoadingMore) {
                    item { Box(modifier = Modifier.fillMaxWidth().padding(LightBiteTheme.spacing.md), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = LightBiteTheme.colors.primary.`500`)
                    }}
                }
            }
            is ScreenState.Empty -> LBEmptyState(title = "No restaurants found", subtitle = "Try a different filter")
            is ScreenState.Error -> LBErrorDisplay(message = state.message, onRetry = viewModel::refresh)
        }
    }
}

@Composable
fun RestaurantCard(restaurant: Restaurant, onClick: () -> Unit) {
    LBCard(onClick = onClick) {
        Row(modifier = Modifier.padding(LightBiteTheme.spacing.md)) {
            // Image placeholder
            Box(modifier = Modifier.size(LightBiteTheme.spacing.xl * 3).then(Modifier.padding(end = LightBiteTheme.spacing.md))) {
                Text("🍽️", style = LightBiteTheme.typography.displayLarge)
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(restaurant.name, style = LightBiteTheme.typography.heading3)
                Text("${restaurant.cuisine} · ⭐ ${restaurant.rating}", style = LightBiteTheme.typography.bodySmall, color = LightBiteTheme.colors.neutral.`400`)
                Row {
                    Text("${restaurant.deliveryTimeMin} min", style = LightBiteTheme.typography.caption)
                    Spacer(Modifier.width(LightBiteTheme.spacing.sm))
                    Text("SAR ${restaurant.deliveryFee}", style = LightBiteTheme.typography.caption)
                }
            }
        }
    }
}

private val CUISINE_OPTIONS = listOf("All", "Burgers", "Pizza", "Asian", "Desserts", "Healthy")

