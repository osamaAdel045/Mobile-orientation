package com.lightbite.shared.core.logger

/**
 * Platform-abstracted logger.
 * Android: android.util.Log
 * iOS: NSLog / os_log
 *
 * NEVER use println() or print() in production.
 * Detekt rule ForbiddenMethodCall blocks them.
 */
expect class AppLogger(tag: String) {
    fun debug(message: String)
    fun info(message: String)
    fun warn(message: String)
    fun error(message: String, throwable: Throwable? = null)
}

/**
 * Factory for creating loggers with a tag.
 * Usage: val log = AppLogger("CartViewModel")
 */
fun appLogger(tag: String): AppLogger = AppLogger(tag)
