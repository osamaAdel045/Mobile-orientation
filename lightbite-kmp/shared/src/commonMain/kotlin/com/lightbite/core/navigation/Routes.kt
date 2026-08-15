package com.lightbite.app.core.navigation

import kotlinx.serialization.Serializable

/**
 * All app routes as @Serializable sealed interfaces.
 *
 * Route files are THIN: each composable<Route> body is EXACTLY ONE
 * screen delegate call. No inline implementations.
 *
 * Detekt rule ThinRouteFiles enforces route files < 25 lines.
 */

// ── Auth Graph ──────────────────────────────────────────────────────────

@Serializable sealed interface AuthRoute {
    @Serializable data object Onboarding : AuthRoute
    @Serializable data object Login : AuthRoute
    @Serializable data object Register : AuthRoute
}

// ── Customer Graph ──────────────────────────────────────────────────────

@Serializable sealed interface CustomerRoute {
    // Tabs
    @Serializable data object Home : CustomerRoute
    @Serializable data object Search : CustomerRoute
    @Serializable data object Orders : CustomerRoute
    @Serializable data object Profile : CustomerRoute

    // Stack screens
    @Serializable data class Restaurant(val uuid: String) : CustomerRoute
    @Serializable data class MenuItem(
        val restaurantUuid: String,
        val menuItemUuid: String,
    ) : CustomerRoute
    @Serializable data object Cart : CustomerRoute
    @Serializable data object Checkout : CustomerRoute
    @Serializable data class OrderConfirmation(val orderUuid: String) : CustomerRoute
    @Serializable data class OrderTracking(val orderUuid: String) : CustomerRoute
    @Serializable data class RateOrder(val orderUuid: String) : CustomerRoute
    @Serializable data object AddressList : CustomerRoute
    @Serializable data class AddressForm(val addressUuid: String? = null) : CustomerRoute
}

// ── Driver Graph ────────────────────────────────────────────────────────

@Serializable sealed interface DriverRoute {
    // Tabs
    @Serializable data object Home : DriverRoute
    @Serializable data object Earnings : DriverRoute
    @Serializable data object History : DriverRoute
    @Serializable data object Profile : DriverRoute

    // Stack screens
    @Serializable data class JobOffer(val orderUuid: String) : DriverRoute
    @Serializable data class Pickup(val orderUuid: String) : DriverRoute
    @Serializable data class Delivery(val orderUuid: String) : DriverRoute
}

// ── Shared Navigation Commands ──────────────────────────────────────────

/**
 * Navigation commands emitted by ViewModels.
 * Screens observe these and navigate accordingly.
 */
sealed interface NavigationCommand {
    data class GoTo(val route: Any) : NavigationCommand
    data object GoBack : NavigationCommand
    data object GoToRoot : NavigationCommand
}
