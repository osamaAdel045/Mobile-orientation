package com.lightbite.app.features.customer.search.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.lightbite.app.core.theme.LightBiteTheme
import com.lightbite.app.core.ui.*
import com.lightbite.shared.core.errors.ScreenState
import com.lightbite.shared.features.customer.home.domain.Restaurant
import org.koin.compose.koinInject

@Composable
fun SearchScreen(
    onRestaurantClick: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: SearchViewModel = koinInject(),
) {
    val screenState by viewModel.screenState.collectAsState()
    val query by viewModel.query.collectAsState()

    Column(modifier = Modifier.fillMaxSize()) {
        LBScreenHeader(title = "Search", onBack = onBack)

        // Search input
        LBInput(
            value = query,
            onValueChange = viewModel::onQueryChanged,
            placeholder = "Search restaurants...",
            modifier = Modifier.padding(horizontal = LightBiteTheme.spacing.md),
        )

        Spacer(Modifier.height(LightBiteTheme.spacing.md))

        // Results
        when (val state = screenState) {
            is ScreenState.Empty -> if (query.isNotBlank()) {
                LBEmptyState(title = "No results for \"$query\"", subtitle = "Try a different search term")
            }
            is ScreenState.Loading -> Column(modifier = Modifier.padding(LightBiteTheme.spacing.md)) {
                repeat(5) { LBSkeleton(height = LightBiteTheme.spacing.lg * 2) }
            }
            is ScreenState.Loaded -> LazyColumn(
                contentPadding = PaddingValues(horizontal = LightBiteTheme.spacing.md),
                verticalArrangement = Arrangement.spacedBy(LightBiteTheme.spacing.sm),
            ) {
                items(state.data, key = { it.uuid }) { restaurant ->
                    SearchResultCard(restaurant) { onRestaurantClick(restaurant.uuid) }
                }
            }
            is ScreenState.Error -> LBErrorDisplay(message = state.message)
        }
    }
}

@Composable
private fun SearchResultCard(restaurant: Restaurant, onClick: () -> Unit) {
    LBCard(onClick = onClick) {
        Row(modifier = Modifier.padding(LightBiteTheme.spacing.md)) {
            Column(modifier = Modifier.weight(1f)) {
                Text(restaurant.name, style = LightBiteTheme.typography.heading3)
                Text("${restaurant.cuisine} · ${restaurant.deliveryTimeMin} min",
                    style = LightBiteTheme.typography.bodySmall, color = LightBiteTheme.colors.neutral.`400`)
            }
        }
    }
}
