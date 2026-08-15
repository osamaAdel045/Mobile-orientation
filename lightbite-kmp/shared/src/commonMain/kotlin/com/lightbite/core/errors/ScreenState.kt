package com.lightbite.shared.core.errors

/**
 * The ONLY screen-state type allowed in ViewModels.
 *
 * Every ViewModel exposes a single StateFlow<ScreenState<T>>.
 * Screens exhaustively render all four states via `when`.
 *
 * Usage:
 *   @Composable
 *   fun MyScreen(vm: MyViewModel = koinViewModel()) {
 *       val state by vm.screenState.collectAsStateWithLifecycle()
 *       when (state) {
 *           is ScreenState.Loading -> LoadingSkeleton()
 *           is ScreenState.Loaded  -> Content(data = state.data)
 *           is ScreenState.Error   -> ErrorState(state.message) { vm.retry() }
 *           is ScreenState.Empty   -> EmptyState()
 *       }
 *   }
 */
sealed interface ScreenState<out T> {
    /** Initial load or explicit refresh in progress. */
    data object Loading : ScreenState<Nothing>

    /** Data available. */
    data class Loaded<T>(val data: T) : ScreenState<T>

    /** Something went wrong. Show the message + a retry action. */
    data class Error(val message: String) : ScreenState<Nothing>

    /** Request succeeded but there is nothing to show. */
    data object Empty : ScreenState<Nothing>
}

/**
 * Maps an AppResult to the appropriate ScreenState.
 * Used by ViewModels to translate repository results uniformly.
 */
fun <T> AppResult<T>.toScreenState(
    isEmpty: (T) -> Boolean = { false },
): ScreenState<T> = when (this) {
    is AppResult.Success -> if (isEmpty(data)) ScreenState.Empty else ScreenState.Loaded(data)
    is AppResult.Failure -> ScreenState.Error(error.message)
}

/**
 * Transforms a ScreenState.Loaded's data while preserving other states.
 */
fun <T, R> ScreenState<T>.mapData(transform: (T) -> R): ScreenState<R> = when (this) {
    is ScreenState.Loaded -> ScreenState.Loaded(transform(data))
    is ScreenState.Loading -> ScreenState.Loading
    is ScreenState.Error -> ScreenState.Error(message)
    is ScreenState.Empty -> ScreenState.Empty
}
