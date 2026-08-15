package com.lightbite.app.core.di

import com.lightbite.app.features.auth.presentation.authViewModelModule
import com.lightbite.app.features.customer.customerViewModelModules
import com.lightbite.app.features.driver.driverViewModelModules
import com.lightbite.shared.core.di.sharedModules
import org.koin.core.module.Module

val appModules: List<Module> = sharedModules +
    listOf(authViewModelModule) +
    customerViewModelModules +
    driverViewModelModules
