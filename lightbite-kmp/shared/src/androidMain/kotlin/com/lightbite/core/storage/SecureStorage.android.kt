package com.lightbite.shared.core.storage

import android.content.Context
import android.content.SharedPreferences

// Simplified SecureStorage using SharedPreferences with private mode.
// In production, replace with EncryptedSharedPreferences (requires adding
// androidx.security:security-crypto dependency to :shared module).
actual class SecureStorage(context: Context) {
    private val prefs: SharedPreferences =
        context.applicationContext.getSharedPreferences("lightbite_secure_prefs", Context.MODE_PRIVATE)

    actual suspend fun save(key: String, value: String) {
        prefs.edit().putString(key, value).apply()
    }

    actual suspend fun get(key: String): String? = prefs.getString(key, null)

    actual suspend fun delete(key: String) {
        prefs.edit().remove(key).apply()
    }

    actual suspend fun clear() {
        prefs.edit().clear().apply()
    }
}
