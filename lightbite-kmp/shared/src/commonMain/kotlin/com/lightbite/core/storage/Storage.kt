package com.lightbite.shared.core.storage

/**
 * Platform-abstracted secure key-value storage for sensitive data (auth tokens).
 *
 * Android: EncryptedSharedPreferences
 * iOS: Keychain Services
 *
 * NEVER use for non-sensitive prefs — use PreferencesStorage instead.
 * NEVER access directly from @Composable — through repositories only.
 */
expect class SecureStorage {
    suspend fun save(key: String, value: String)
    suspend fun get(key: String): String?
    suspend fun delete(key: String)
    suspend fun clear()
}

/**
 * Non-sensitive key-value storage for preferences (theme, locale, onboarding-complete).
 *
 * Android: DataStore<Preferences>
 * iOS: NSUserDefaults
 */
expect class PreferencesStorage {
    suspend fun saveString(key: String, value: String)
    suspend fun getString(key: String): String?
    suspend fun saveBoolean(key: String, value: Boolean)
    suspend fun getBoolean(key: String): Boolean?
    suspend fun saveInt(key: String, value: Int)
    suspend fun getInt(key: String): Int?
    suspend fun delete(key: String)
    suspend fun clear()
}

/**
 * Well-known storage keys. Each key documents what layer may access it.
 */
object StorageKeys {
    // Auth (accessed by AuthRepository only)
    const val ACCESS_TOKEN = "auth_access_token"
    const val REFRESH_TOKEN = "auth_refresh_token"
    const val USER_JSON = "auth_user_json"

    // Preferences (accessed by PreferencesStorage consumers)
    const val THEME_MODE = "pref_theme_mode"
    const val LOCALE = "pref_locale"
    const val ONBOARDING_COMPLETE = "pref_onboarding_complete"
    const val RECENT_SEARCHES = "pref_recent_searches"

    // Driver (accessed by DriverRepository only)
    const val DRIVER_IS_ONLINE = "driver_is_online"
    const val ACTIVE_DELIVERY_JSON = "driver_active_delivery_json"
}
