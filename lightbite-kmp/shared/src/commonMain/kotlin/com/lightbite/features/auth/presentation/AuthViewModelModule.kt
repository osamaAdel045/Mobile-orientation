package com.lightbite.app.features.auth.presentation

import org.koin.dsl.module

/**
 * ComposeApp Koin module for the auth feature ViewModel.
 * ViewModels live in :composeApp because they depend on Compose lifecycle.
 */
val authViewModelModule = module {
    factory { AuthViewModel(get()) }
}
