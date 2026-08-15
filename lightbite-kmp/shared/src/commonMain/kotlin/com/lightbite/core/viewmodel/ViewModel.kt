package com.lightbite.app.core.viewmodel

import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel

open class ViewModel {
    private val exceptionHandler = CoroutineExceptionHandler { _, throwable ->
        println("ViewModel coroutine error: ${throwable.message}")
    }

    val viewModelScope = CoroutineScope(
        SupervisorJob() + Dispatchers.Main + exceptionHandler
    )

    open fun onCleared() {
        viewModelScope.cancel()
    }
}

/**
 * Global coroutine exception handler — prevents SIGABRT on iOS
 * when Compose internal coroutines throw unhandled exceptions.
 * Must be set as default handler for all coroutine scopes.
 */
val globalExceptionHandler = CoroutineExceptionHandler { _, throwable ->
    println("Global coroutine error: ${throwable.message}")
}

/** Scope for launching coroutines that need global exception handling. */
val AppScope = CoroutineScope(
    SupervisorJob() + Dispatchers.Main + globalExceptionHandler
)
