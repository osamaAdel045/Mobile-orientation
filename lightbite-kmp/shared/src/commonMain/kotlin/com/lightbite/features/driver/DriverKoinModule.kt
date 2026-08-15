package com.lightbite.app.features.driver

import org.koin.core.module.Module
import org.koin.dsl.module

val driverViewModelModules: List<Module> = listOf(
    module {
        factory { DriverHomeViewModel(get()) }
        factory { DriverJobViewModel(get()) }
        factory { DriverDeliveryViewModel(get()) }
        factory { DriverEarningsViewModel(get()) }
        factory { DriverHistoryViewModel(get()) }
    }
)
