package com.lightbite.shared.features.auth.domain

import kotlinx.serialization.Serializable

/**
 * User entity — the domain representation of an authenticated user.
 */
@Serializable
data class User(
    val uuid: String,
    val name: String,
    val email: String,
    val phone: String?,
    val role: UserRole,
    val avatarUrl: String?,
)

@Serializable
enum class UserRole {
    CUSTOMER,
    DRIVER,
    ADMIN,
}

/**
 * Auth state emitted by AuthRepository/AuthViewModel.
 * This is the global auth state, not a per-screen state.
 */
sealed interface AuthState {
    /** Checking stored tokens on app start. */
    data object Loading : AuthState

    /** No valid token found. Show auth screens. */
    data object Unauthenticated : AuthState

    /** Valid token exists. Route to app based on user.role. */
    data class Authenticated(val user: User) : AuthState
}

/**
 * Credentials for login/register requests.
 */
data class LoginCredentials(
    val email: String,
    val password: String,
)

data class RegisterCredentials(
    val name: String,
    val email: String,
    val password: String,
    val phone: String,
    val role: UserRole = UserRole.CUSTOMER,
)

/**
 * Tokens returned by the auth API.
 */
data class AuthTokens(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long? = null,
)
