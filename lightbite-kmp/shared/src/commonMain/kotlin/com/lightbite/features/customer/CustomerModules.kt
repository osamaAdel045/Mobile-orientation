package com.lightbite.shared.features.customer

import com.lightbite.shared.features.customer.home.data.HomeRemoteDataSource
import com.lightbite.shared.features.customer.home.data.HomeRepositoryImpl
import com.lightbite.shared.features.customer.home.domain.HomeRepository
import com.lightbite.shared.features.customer.restaurant.data.RestaurantRemoteDataSource
import com.lightbite.shared.features.customer.restaurant.data.RestaurantRepositoryImpl
import com.lightbite.shared.features.customer.restaurant.domain.RestaurantRepository
import com.lightbite.shared.features.customer.search.data.SearchRemoteDataSource
import com.lightbite.shared.features.customer.search.data.SearchRepositoryImpl
import com.lightbite.shared.features.customer.search.domain.SearchRepository
import org.koin.dsl.module

/**
 * Shared Koin modules for all customer features.
 */
val customerModules = listOf(
    module {
        // Home
        single<HomeRemoteDataSource> { HomeRemoteDataSource(get()) }
        single<HomeRepository> { HomeRepositoryImpl(get()) }

        // Restaurant
        single<RestaurantRemoteDataSource> { RestaurantRemoteDataSource(get()) }
        single<RestaurantRepository> { RestaurantRepositoryImpl(get()) }

        // Search
        single<SearchRemoteDataSource> { SearchRemoteDataSource(get()) }
        single<SearchRepository> { SearchRepositoryImpl(get()) }
    }
)
