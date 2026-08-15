package com.lightbite.shared.core.errors

/**
 * Typed error hierarchy for all domain errors.
 * Every Repository method returns AppResult<T>, never throws.
 *
 * Maps from the Laravel API error envelope:
 * { "message": "...", "errors": { "field": ["error1", "error2"] } }
 */
sealed class AppError(
    open val message: String,
    open val code: String? = null,
) {
    /** Network-level failure (timeout, DNS, no connectivity) */
    data class NetworkError(override val message: String) : AppError(message)

    /** Server returned a non-2xx status with a known error code */
    data class ServerError(
        override val message: String,
        override val code: String? = null,
        val statusCode: Int? = null,
    ) : AppError(message, code)

    /** 401 — token expired or invalid */
    data class Unauthorized(
        override val message: String = "Session expired. Please log in again.",
    ) : AppError(message, "unauthorized")

    /** 422 — validation errors keyed by field name */
    data class ValidationError(
        override val message: String,
        val errors: Map<String, List<String>> = emptyMap(),
    ) : AppError(message, "validation_error")

    /** 404 — resource not found */
    data class NotFound(
        override val message: String = "The requested resource was not found.",
    ) : AppError(message, "not_found")

    /** 409 — conflict (e.g., duplicate cart item) */
    data class Conflict(
        override val message: String,
    ) : AppError(message, "conflict")

    /** Catch-all for unexpected errors */
    data class Unknown(
        override val message: String = "Something went wrong. Please try again.",
    ) : AppError(message, "unknown")
}

/**
 * Maps an HTTP status code and error body to the appropriate AppError variant.
 */
fun mapApiError(
    statusCode: Int,
    message: String?,
    errors: Map<String, List<String>>? = null,
): AppError = when (statusCode) {
    401 -> AppError.Unauthorized(message ?: "Session expired")
    404 -> AppError.NotFound(message ?: "Not found")
    409 -> AppError.Conflict(message ?: "Conflict")
    422 -> AppError.ValidationError(message ?: "Validation failed", errors ?: emptyMap())
    in 400..499 -> AppError.ServerError(message ?: "Client error", statusCode = statusCode)
    in 500..599 -> AppError.ServerError(message ?: "Server error", statusCode = statusCode)
    else -> AppError.Unknown(message ?: "Unexpected error")
}
