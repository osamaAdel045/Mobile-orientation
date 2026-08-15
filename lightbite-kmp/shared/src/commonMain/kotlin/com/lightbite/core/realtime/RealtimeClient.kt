package com.lightbite.shared.core.realtime

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow

/**
 * Connection state for the realtime transport.
 */
sealed interface ConnectionState {
    data object Connected : ConnectionState
    data object Disconnected : ConnectionState
    data class Reconnecting(val attempt: Int) : ConnectionState
}

/**
 * A realtime event received from the server.
 */
data class RealtimeEvent(
    val channel: String,
    val event: String,      // e.g., "OrderStatusChanged", "NewDriverJob"
    val data: String,       // JSON payload
)

/**
 * Single contract for all realtime features.
 *
 * WebSocket is the PRIMARY transport. When the NetworkMonitor reports
 * disconnection, the client transparently falls back to polling with
 * exponential backoff. Features NEVER implement their own polling.
 *
 * Usage:
 *   class OrderTrackingViewModel(
 *       private val realtime: RealtimeClient,
 *   ) : ViewModel() {
 *       init {
 *           realtime.subscribe("private-orders.${userId}")
 *               .onEach { event -> handleEvent(event) }
 *               .launchIn(viewModelScope)
 *       }
 *   }
 */
interface RealtimeClient {
    /** Current connection state. */
    val connectionState: StateFlow<ConnectionState>

    /**
     * Subscribe to a channel. Returns a cold Flow that emits events.
     * Channels follow the Laravel Reverb convention:
     *   - private-orders.{userId}
     *   - private-driver.{driverId}
     *   - private-delivery.{orderUuid}
     */
    fun subscribe(channel: String): Flow<RealtimeEvent>

    /** Unsubscribe from a channel. */
    suspend fun unsubscribe(channel: String)

    /** Connect to the realtime server. Called once on app start. */
    suspend fun connect()

    /** Disconnect. Called on logout or app background. */
    suspend fun disconnect()
}
