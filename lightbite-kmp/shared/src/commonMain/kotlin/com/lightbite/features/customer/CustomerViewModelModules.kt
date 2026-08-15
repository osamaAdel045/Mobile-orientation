package com.lightbite.app.features.customer

import com.lightbite.app.features.RateOrderViewModel
import com.lightbite.app.features.AddressViewModel
import com.lightbite.app.features.customer.home.presentation.HomeViewModel
import com.lightbite.app.features.customer.restaurant.presentation.RestaurantViewModel
import com.lightbite.app.features.customer.search.presentation.SearchViewModel
import org.koin.dsl.module

val customerViewModelModules = listOf(
    module {
        factory { HomeViewModel(get()) }
        factory { RestaurantViewModel(get()) }
        factory { SearchViewModel(get()) }
        factory { CartViewModel(get()) }
        factory { CheckoutViewModel(get()) }
        factory { OrderListViewModel(get()) }
        factory { OrderTrackingViewModel(get()) }
        factory { RateOrderViewModel(get()) }
        factory { AddressViewModel(get()) }
    }
)
