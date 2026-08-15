package com.lightbite.shared.features.auth.data

import com.lightbite.shared.features.auth.domain.AuthTokens
import com.lightbite.shared.features.auth.domain.User
import com.lightbite.shared.features.auth.domain.UserRole
import kotlinx.serialization.Serializable

/**
 * DTOs for the auth API.
 *
 * Laravel API response envelope: { "data": { ... }, "message": "..." }
 * These DTOs represent the `data` field contents.
 */

@Serializable
data class LoginRequest(
    val email: String,
    val password: String,
)

@Serializable
data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val password_confirmation: String,
    val phone: String,
    val role: String = "customer",
)

@Serializable
data class AuthResponse(
    val user: UserDto,
    val token: TokenDto,
)

@Serializable
data class UserDto(
    val uuid: String,
    val name: String,
    val email: String,
    val phone: String? = null,
    val role: String,
    val avatar_url: String? = null,
)

@Serializable
data class TokenDto(
    val access_token: String,
    val refresh_token: String,
    val token_type: String = "Bearer",
    val expires_in: Long? = null,
)

@Serializable
data class RefreshTokenRequest(
    val refresh_token: String,
)

@Serializable
data class LogoutResponse(
    val message: String,
)

/**
 * Maps DTOs to domain entities.
 */
fun UserDto.toDomain(): User = User(
    uuid = uuid,
    name = name,
    email = email,
    phone = phone,
    role = when (role) {
        "driver" -> UserRole.DRIVER
        "admin" -> UserRole.ADMIN
        else -> UserRole.CUSTOMER
    },
    avatarUrl = avatar_url,
)

fun TokenDto.toDomain(): AuthTokens = AuthTokens(
    accessToken = access_token,
    refreshToken = refresh_token,
    tokenType = token_type,
    expiresIn = expires_in,
)
