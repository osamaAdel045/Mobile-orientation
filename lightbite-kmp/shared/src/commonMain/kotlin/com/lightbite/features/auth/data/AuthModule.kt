package com.lightbite.shared.features.auth.data

import com.lightbite.shared.features.auth.domain.AuthRepository
import org.koin.dsl.module

/**
 * Shared Koin module for the auth feature.
 * Registers repository and data source singletons.
 */
val authModule = module {
    single<AuthRemoteDataSource> { AuthRemoteDataSource(get()) }
    single<AuthRepository> { AuthRepositoryImpl(get(), get(), get()) }
}
