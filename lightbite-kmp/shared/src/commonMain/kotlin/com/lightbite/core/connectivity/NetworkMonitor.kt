package com.lightbite.shared.core.connectivity

import kotlinx.coroutines.flow.StateFlow

/**
 * Platform-abstracted network connectivity monitor.
 *
 * Android: ConnectivityManager.registerDefaultNetworkCallback
 * iOS: NWPathMonitor
 *
 * Emits true when the device has internet connectivity, false otherwise.
 */
expect class NetworkMonitor {
    /** A hot flow emitting the current connectivity state. */
    val isConnected: StateFlow<Boolean>
}
