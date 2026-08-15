package com.lightbite.shared.features.customer.address.domain

import com.lightbite.shared.core.errors.AppResult

data class Address(val uuid: String, val label: String, val street: String, val city: String, val building: String?, val floor: String?, val notes: String?, val isDefault: Boolean)

interface AddressRepository {
    suspend fun getAddresses(): AppResult<List<Address>>
    suspend fun createAddress(request: AddressRequest): AppResult<Address>
    suspend fun updateAddress(uuid: String, request: AddressRequest): AppResult<Address>
    suspend fun deleteAddress(uuid: String): AppResult<Unit>
}

data class AddressRequest(val label: String, val street: String, val city: String, val building: String? = null, val floor: String? = null, val notes: String? = null, val is_default: Boolean = false)
