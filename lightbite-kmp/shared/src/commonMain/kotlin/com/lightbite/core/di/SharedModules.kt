package com.lightbite.shared.core.di

import com.lightbite.shared.features.auth.data.authModule
import com.lightbite.shared.features.customer.customerModules
import com.lightbite.shared.features.customer.remainingCustomerModules
import com.lightbite.shared.features.driver.driverSharedModules
import org.koin.core.module.Module

val sharedModules: List<Module> = listOf(authModule) +
    customerModules +
    remainingCustomerModules +
    driverSharedModules
