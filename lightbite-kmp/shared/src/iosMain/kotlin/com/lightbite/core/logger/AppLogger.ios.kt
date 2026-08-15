package com.lightbite.shared.core.logger

import platform.Foundation.NSLog

actual class AppLogger actual constructor(private val tag: String) {
    actual fun debug(message: String) = NSLog("[DEBUG][$tag] %@", message)
    actual fun info(message: String) = NSLog("[INFO][$tag] %@", message)
    actual fun warn(message: String) = NSLog("[WARN][$tag] %@", message)
    actual fun error(message: String, throwable: Throwable?) {
        val errorMsg = if (throwable != null) "$message: ${throwable.message}" else message
        NSLog("[ERROR][$tag] %@", errorMsg)
    }
}
