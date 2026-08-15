package com.lightbite.app

import androidx.compose.ui.window.ComposeUIViewController
import com.lightbite.shared.core.api.ApiClient
import com.lightbite.shared.core.di.sharedModules
import io.ktor.client.HttpClient
import io.ktor.client.engine.darwin.Darwin
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import org.koin.core.context.startKoin
import org.koin.dsl.module

fun MainViewController() = ComposeUIViewController {
    initKoin()
    LightBiteApp()
}

private var koinStarted = false

private fun initKoin() {
    if (koinStarted) return

    // Create iOS-specific HttpClient (Darwin engine)
    val iosHttpClient = HttpClient(Darwin) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }

    // Create ApiClient
    val apiClient = ApiClient(iosHttpClient)

    // Register everything in Koin
    startKoin {
        modules(
            sharedModules + listOf(
                module {
                    single<HttpClient> { iosHttpClient }
                    single { apiClient }
                }
            )
        )
    }
    koinStarted = true
}
