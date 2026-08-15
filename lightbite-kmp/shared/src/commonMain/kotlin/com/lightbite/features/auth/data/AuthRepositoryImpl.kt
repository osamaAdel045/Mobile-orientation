package com.lightbite.shared.features.auth.data

import com.lightbite.shared.core.errors.AppError
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.core.logger.appLogger
import com.lightbite.shared.core.storage.SecureStorage
import com.lightbite.shared.core.storage.StorageKeys
import com.lightbite.shared.features.auth.domain.AuthRepository
import com.lightbite.shared.features.auth.domain.AuthState
import com.lightbite.shared.features.auth.domain.AuthTokens
import com.lightbite.shared.features.auth.domain.LoginCredentials
import com.lightbite.shared.features.auth.domain.RegisterCredentials
import com.lightbite.shared.features.auth.domain.User
import kotlinx.serialization.json.Json

class AuthRepositoryImpl(
    private val remoteDataSource: AuthRemoteDataSource,
    private val secureStorage: SecureStorage,
    private val json: Json,
) : AuthRepository {

    private val log = appLogger("AuthRepo")

    override suspend fun checkAuth(): AuthState {
        return try {
            val userJson = secureStorage.get(StorageKeys.USER_JSON)
            val accessToken = secureStorage.get(StorageKeys.ACCESS_TOKEN)
            if (userJson != null && accessToken != null) {
                val user = json.decodeFromString<User>(userJson)
                AuthState.Authenticated(user)
            } else {
                AuthState.Unauthenticated
            }
        } catch (e: Exception) {
            clearTokens()
            AuthState.Unauthenticated
        }
    }

    override suspend fun login(credentials: LoginCredentials): AppResult<User> {
        val result = remoteDataSource.login(LoginRequest(credentials.email, credentials.password))
        return when (result) {
            is AppResult.Success -> {
                persistTokens(result.data.token.toDomain())
                val user = result.data.user.toDomain()
                persistUser(user)
                AppResult.success(user)
            }
            is AppResult.Failure -> result
        }
    }

    override suspend fun register(credentials: RegisterCredentials): AppResult<User> {
        val request = RegisterRequest(
            name = credentials.name, email = credentials.email,
            password = credentials.password, password_confirmation = credentials.password,
            phone = credentials.phone,
            role = when (credentials.role) {
                com.lightbite.shared.features.auth.domain.UserRole.CUSTOMER -> "customer"
                com.lightbite.shared.features.auth.domain.UserRole.DRIVER -> "driver"
                com.lightbite.shared.features.auth.domain.UserRole.ADMIN -> "admin"
            },
        )
        val result = remoteDataSource.register(request)
        return when (result) {
            is AppResult.Success -> {
                persistTokens(result.data.token.toDomain())
                val user = result.data.user.toDomain()
                persistUser(user)
                AppResult.success(user)
            }
            is AppResult.Failure -> result
        }
    }

    override suspend fun logout() {
        try { remoteDataSource.logout() } catch (_: Exception) {}
        clearTokens()
    }

    override suspend fun refreshToken(): AppResult<AuthTokens> {
        val refreshToken = getRefreshToken()
            ?: return AppResult.failure(AppError.Unauthorized("No refresh token"))
        val result = remoteDataSource.refreshToken(RefreshTokenRequest(refresh_token = refreshToken))
        return when (result) {
            is AppResult.Success -> {
                persistTokens(result.data.token.toDomain())
                AppResult.success(result.data.token.toDomain())
            }
            is AppResult.Failure -> {
                clearTokens()
                result
            }
        }
    }

    override suspend fun getAccessToken(): String? = secureStorage.get(StorageKeys.ACCESS_TOKEN)
    override suspend fun getRefreshToken(): String? = secureStorage.get(StorageKeys.REFRESH_TOKEN)

    private suspend fun persistTokens(tokens: AuthTokens) {
        secureStorage.save(StorageKeys.ACCESS_TOKEN, tokens.accessToken)
        secureStorage.save(StorageKeys.REFRESH_TOKEN, tokens.refreshToken)
    }

    private suspend fun persistUser(user: User) {
        secureStorage.save(StorageKeys.USER_JSON, json.encodeToString(User.serializer(), user))
    }

    private suspend fun clearTokens() {
        secureStorage.delete(StorageKeys.ACCESS_TOKEN)
        secureStorage.delete(StorageKeys.REFRESH_TOKEN)
        secureStorage.delete(StorageKeys.USER_JSON)
    }
}
