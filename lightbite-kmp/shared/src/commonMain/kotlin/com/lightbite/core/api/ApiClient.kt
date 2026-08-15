package com.lightbite.shared.core.api

import com.lightbite.shared.core.errors.AppError
import com.lightbite.shared.core.errors.AppResult
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.*
import io.ktor.client.statement.HttpResponse
import io.ktor.http.ContentType
import io.ktor.http.contentType

class ApiClient(@PublishedApi internal val httpClient: HttpClient) {

    suspend inline fun <reified T> get(url: String, params: Map<String, String> = emptyMap()): AppResult<T> =
        execute { client ->
            client.get(url) { params.forEach { (k, v) -> parameter(k, v) } }
        }

    suspend inline fun <reified T> post(url: String, body: Any): AppResult<T> =
        execute { client ->
            client.post(url) { contentType(ContentType.Application.Json); setBody(body) }
        }

    suspend inline fun <reified T> put(url: String, body: Any): AppResult<T> =
        execute { client ->
            client.put(url) { contentType(ContentType.Application.Json); setBody(body) }
        }

    suspend inline fun <reified T> patch(url: String, body: Any): AppResult<T> =
        execute { client ->
            client.patch(url) { contentType(ContentType.Application.Json); setBody(body) }
        }

    suspend inline fun <reified T> delete(url: String): AppResult<T> =
        execute { client -> client.delete(url) }

    suspend fun postEmpty(url: String): AppResult<Unit> = try {
        httpClient.post(url)
        AppResult.success(Unit)
    } catch (e: Exception) {
        AppResult.failure(mapError(e))
    }

    @PublishedApi
    internal suspend inline fun <reified T> execute(
        noinline request: suspend (HttpClient) -> HttpResponse,
    ): AppResult<T> = try {
        AppResult.success(request(httpClient).body<T>())
    } catch (e: Exception) {
        AppResult.failure(mapError(e))
    }

    @PublishedApi
    internal fun mapError(e: Exception): AppError = when {
        e is io.ktor.client.plugins.HttpRequestTimeoutException -> AppError.NetworkError("Request timed out.")
        e.message?.contains("Unable to resolve host", ignoreCase = true) == true -> AppError.NetworkError("No internet.")
        else -> AppError.NetworkError(e.message ?: "Network error.")
    }
}
