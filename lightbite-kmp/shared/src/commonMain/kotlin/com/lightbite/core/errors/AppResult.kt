package com.lightbite.shared.core.errors

/**
 * Type-safe result type that every Repository returns.
 * NEVER throw in Repository methods — always return AppResult.
 *
 * Usage:
 *   repository.getCart().let { result ->
 *       when (result) {
 *           is AppResult.Success -> { /* use result.data */ }
 *           is AppResult.Failure -> { /* handle result.error */ }
 *       }
 *   }
 *
 * RunCatching is BANNED in ViewModels (enforced by detekt NoRunCatchingInViewModel).
 */
sealed class AppResult<out T> {

    data class Success<T>(val data: T) : AppResult<T>()

    data class Failure(val error: AppError) : AppResult<Nothing>()

    val isSuccess: Boolean get() = this is Success
    val isFailure: Boolean get() = this is Failure

    /** Transform the success value; passes through failures unchanged. */
    fun <R> map(transform: (T) -> R): AppResult<R> = when (this) {
        is Success -> Success(transform(data))
        is Failure -> this
    }

    /** Chain another Result-returning operation. */
    fun <R> flatMap(transform: (T) -> AppResult<R>): AppResult<R> = when (this) {
        is Success -> transform(data)
        is Failure -> this
    }

    /** Unwrap or return a default value. */
    fun getOrDefault(default: @UnsafeVariance T): T = when (this) {
        is Success -> data
        is Failure -> default
    }

    /** Unwrap or null. */
    fun getOrNull(): T? = when (this) {
        is Success -> data
        is Failure -> null
    }

    /** Execute a side-effect on success. Returns this for chaining. */
    fun onSuccess(action: (T) -> Unit): AppResult<T> {
        if (this is Success) action(data)
        return this
    }

    /** Execute a side-effect on failure. Returns this for chaining. */
    fun onFailure(action: (AppError) -> Unit): AppResult<T> {
        if (this is Failure) action(error)
        return this
    }

    /** Unwrap the value or throw. Use only at the top-level boundary. */
    fun getOrThrow(): T = when (this) {
        is Success -> data
        is Failure -> throw IllegalStateException("AppResult is Failure: ${error.message}")
    }

    companion object {
        fun <T> success(data: T): AppResult<T> = Success(data)
        fun failure(error: AppError): AppResult<Nothing> = Failure(error)
    }
}
