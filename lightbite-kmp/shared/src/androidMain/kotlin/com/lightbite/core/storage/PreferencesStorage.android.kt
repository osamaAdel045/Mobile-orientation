package com.lightbite.shared.core.storage

import android.content.Context
import android.content.SharedPreferences

// Simplified PreferencesStorage using SharedPreferences (available on Android without extra deps).
// Full DataStore implementation can replace this once DataStore dependency is added to :shared.
actual class PreferencesStorage(context: Context) {
    private val prefs: SharedPreferences =
        context.applicationContext.getSharedPreferences("lightbite_prefs", Context.MODE_PRIVATE)

    actual suspend fun saveString(key: String, value: String) {
        prefs.edit().putString(key, value).apply()
    }

    actual suspend fun getString(key: String): String? = prefs.getString(key, null)

    actual suspend fun saveBoolean(key: String, value: Boolean) {
        prefs.edit().putBoolean(key, value).apply()
    }

    actual suspend fun getBoolean(key: String): Boolean? =
        if (prefs.contains(key)) prefs.getBoolean(key, false) else null

    actual suspend fun saveInt(key: String, value: Int) {
        prefs.edit().putInt(key, value).apply()
    }

    actual suspend fun getInt(key: String): Int? =
        if (prefs.contains(key)) prefs.getInt(key, 0) else null

    actual suspend fun delete(key: String) {
        prefs.edit().remove(key).apply()
    }

    actual suspend fun clear() {
        prefs.edit().clear().apply()
    }
}
