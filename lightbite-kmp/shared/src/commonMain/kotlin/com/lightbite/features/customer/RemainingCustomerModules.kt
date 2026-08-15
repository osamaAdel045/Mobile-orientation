package com.lightbite.shared.features.customer

import com.lightbite.shared.features.customer.address.data.AddressRemoteDataSource
import com.lightbite.shared.features.customer.address.data.AddressRepositoryImpl
import com.lightbite.shared.features.customer.address.domain.AddressRepository
import com.lightbite.shared.features.customer.cart.data.CartRemoteDataSource
import com.lightbite.shared.features.customer.cart.data.CartRepositoryImpl
import com.lightbite.shared.features.customer.cart.domain.CartRepository
import com.lightbite.shared.features.customer.checkout.data.CheckoutRemoteDataSource
import com.lightbite.shared.features.customer.checkout.data.CheckoutRepositoryImpl
import com.lightbite.shared.features.customer.checkout.domain.CheckoutRepository
import com.lightbite.shared.features.customer.order.data.OrderRemoteDataSource
import com.lightbite.shared.features.customer.order.data.OrderRepositoryImpl
import com.lightbite.shared.features.customer.order.domain.OrderRepository
import com.lightbite.shared.features.customer.rate_order.data.RateOrderRemoteDataSource
import com.lightbite.shared.features.customer.rate_order.data.RateOrderRepositoryImpl
import com.lightbite.shared.features.customer.rate_order.domain.RateOrderRepository
import org.koin.dsl.module

val remainingCustomerModules = listOf(
    module {
        // Cart
        single<CartRemoteDataSource> { CartRemoteDataSource(get()) }
        single<CartRepository> { CartRepositoryImpl(get()) }
        // Checkout
        single<CheckoutRemoteDataSource> { CheckoutRemoteDataSource(get()) }
        single<CheckoutRepository> { CheckoutRepositoryImpl(get()) }
        // Order
        single<OrderRemoteDataSource> { OrderRemoteDataSource(get()) }
        single<OrderRepository> { OrderRepositoryImpl(get()) }
        // Rate Order
        single<RateOrderRemoteDataSource> { RateOrderRemoteDataSource(get()) }
        single<RateOrderRepository> { RateOrderRepositoryImpl(get(), get()) }
        // Address
        single<AddressRemoteDataSource> { AddressRemoteDataSource(get()) }
        single<AddressRepository> { AddressRepositoryImpl(get()) }
    }
)
