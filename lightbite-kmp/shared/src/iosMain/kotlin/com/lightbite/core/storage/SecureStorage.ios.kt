package com.lightbite.shared.core.storage

import platform.Foundation.NSUserDefaults

// Stub: uses NSUserDefaults. Replace with Keychain Services for production.
actual class SecureStorage {
    private val defaults = NSUserDefaults.standardUserDefaults
    private val prefix = "lightbite_secure_"

    private fun key(name: String) = "$prefix$name"

    actual suspend fun save(key: String, value: String) {
        defaults.setObject(value, forKey = key(key))
    }

    actual suspend fun get(key: String): String? = defaults.stringForKey(key(key))

    actual suspend fun delete(key: String) {
        defaults.removeObjectForKey(key(key))
    }

    actual suspend fun clear() {
        // Remove all keys with our prefix
        val dict = defaults.dictionaryRepresentation()
        for (k in dict.keys) {
            val keyStr = k as? String ?: continue
            if (keyStr.startsWith(prefix)) defaults.removeObjectForKey(keyStr)
        }
    }
}
