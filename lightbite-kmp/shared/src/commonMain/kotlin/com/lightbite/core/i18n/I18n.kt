package com.lightbite.app.core.i18n

import androidx.compose.runtime.Composable

/**
 * LightBite i18n — Compose Multiplatform string access.
 *
 * Strings are defined here as constants for commonMain access.
 * Platform-specific implementations (Android strings.xml, iOS Localizable.xcstrings)
 * are in their respective source sets.
 *
 * TODO: Migrate to compose.resources when Res generation is verified.
 */

object Strings {
    const val app_name = "LightBite"
    const val common_retry = "Try Again"
    const val common_cancel = "Cancel"
    const val common_no_internet = "No internet connection"
    const val common_error = "Something went wrong"

    const val auth_login = "Log In"
    const val auth_login_subtitle = "Welcome back! Enter your details to continue."
    const val auth_register = "Sign Up"
    const val auth_register_title = "Create Account"
    const val auth_register_subtitle = "Join LightBite and start ordering."
    const val auth_no_account = "Don't have an account? Sign Up"
    const val auth_have_account = "Already have an account? Log In"
    const val auth_email = "Email"
    const val auth_password = "Password"
    const val auth_name = "Name"
    const val auth_phone = "Phone Number"
    const val auth_logout = "Log Out"

    const val cart_title = "Cart"
    const val cart_empty = "Your cart is empty"
    const val cart_checkout = "Proceed to Checkout"

    const val checkout_title = "Checkout"
    const val checkout_place_order = "Place Order — Cash on Delivery"

    const val order_title = "My Orders"
    const val order_empty = "No orders yet"
    const val order_tracking_title = "Track Order"

    const val address_title = "My Addresses"
    const val address_empty = "No saved addresses"
    const val address_add = "Add New Address"

    const val rate_title = "Rate Your Order"
    const val rate_submit = "Submit"

    const val driver_home_title = "Driver Dashboard"
    const val driver_online = "Go Online"
    const val driver_offline = "Go Offline"
    const val driver_earnings_title = "Earnings"
    const val driver_history_title = "Order History"
    const val driver_delivery_pickup = "Confirm Pickup"
    const val driver_delivery_start = "Start Delivery"
    const val driver_delivery_confirm = "Confirm Delivery"
    const val driver_delivery_complete = "Delivery Complete!"

    const val profile_title = "Profile"
    const val profile_logout = "Log Out"
}

@Composable
fun lbString(value: String): String = value

@Composable
fun lbString(value: String, vararg formatArgs: Any): String =
    value.replaceFirst("%s", formatArgs.firstOrNull()?.toString() ?: "")
        .replaceFirst("%1\$s", formatArgs.firstOrNull()?.toString() ?: "")
        .replaceFirst("%1\$.2f", formatArgs.firstOrNull()?.toString() ?: "")
        .replaceFirst("%1\$d", formatArgs.firstOrNull()?.toString() ?: "")
