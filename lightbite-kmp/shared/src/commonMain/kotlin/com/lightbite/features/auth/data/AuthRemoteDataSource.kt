package com.lightbite.shared.features.auth.data

import com.lightbite.shared.core.api.ApiClient
import com.lightbite.shared.core.errors.AppResult

/**
 * Raw API calls for auth endpoints.
 * Returns AppResult — errors are mapped by ApiClient.
 */
class AuthRemoteDataSource(
    private val apiClient: ApiClient,
) {
    suspend fun login(request: LoginRequest): AppResult<AuthResponse> =
        apiClient.post("/auth/login", request)

    suspend fun register(request: RegisterRequest): AppResult<AuthResponse> =
        apiClient.post("/auth/register", request)

    suspend fun refreshToken(request: RefreshTokenRequest): AppResult<AuthResponse> =
        apiClient.post("/auth/refresh", request)

    suspend fun logout(): AppResult<Unit> =
        apiClient.postEmpty("/auth/logout")

    suspend fun getProfile(): AppResult<UserDto> =
        apiClient.get("/users/me")
}
