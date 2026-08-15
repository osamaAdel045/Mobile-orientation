package com.lightbite.shared.features.auth.domain

import com.lightbite.shared.core.errors.AppResult

/**
 * Repository contract for authentication.
 *
 * Implementation handles:
 *   - SecureStorage for token persistence
 *   - RemoteDataSource for API calls
 *   - Token refresh with queue-safe single-flight pattern
 */
interface AuthRepository {
    /** Check stored tokens and return current auth state. */
    suspend fun checkAuth(): AuthState

    /** Log in with email/password. Persists tokens on success. */
    suspend fun login(credentials: LoginCredentials): AppResult<User>

    /** Register a new account. Persists tokens on success. */
    suspend fun register(credentials: RegisterCredentials): AppResult<User>

    /** Log out. Clears stored tokens. */
    suspend fun logout()

    /** Refresh the access token. Returns new tokens or fails. */
    suspend fun refreshToken(): AppResult<AuthTokens>

    /** Get the current access token (for the API interceptor). */
    suspend fun getAccessToken(): String?

    /** Get the current refresh token. */
    suspend fun getRefreshToken(): String?
}
