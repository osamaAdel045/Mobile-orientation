package com.lightbite.shared.core.storage

import platform.Foundation.NSUserDefaults

actual class PreferencesStorage {
    private val defaults = NSUserDefaults.standardUserDefaults

    actual suspend fun saveString(key: String, value: String) {
        defaults.setObject(value, forKey = key)
    }

    actual suspend fun getString(key: String): String? = defaults.stringForKey(key)

    actual suspend fun saveBoolean(key: String, value: Boolean) {
        defaults.setBool(value, forKey = key)
    }

    actual suspend fun getBoolean(key: String): Boolean? {
        return if (defaults.objectForKey(key) != null) defaults.boolForKey(key) else null
    }

    actual suspend fun saveInt(key: String, value: Int) {
        defaults.setInteger(value.toLong(), forKey = key)
    }

    actual suspend fun getInt(key: String): Int? {
        return if (defaults.objectForKey(key) != null) defaults.integerForKey(key).toInt() else null
    }

    actual suspend fun delete(key: String) {
        defaults.removeObjectForKey(key)
    }

    actual suspend fun clear() {
        val domain = platform.Foundation.NSBundle.mainBundle.bundleIdentifier ?: return
        defaults.removePersistentDomainForName(domain)
    }
}
