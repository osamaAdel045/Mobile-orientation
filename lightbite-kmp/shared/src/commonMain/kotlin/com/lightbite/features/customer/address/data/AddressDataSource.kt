package com.lightbite.shared.features.customer.address.data

import com.lightbite.shared.core.api.ApiClient
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.features.customer.address.domain.*
import kotlinx.serialization.Serializable

class AddressRemoteDataSource(private val apiClient: ApiClient) {
    suspend fun getAddresses(): AppResult<List<AddressDto>> = apiClient.get("/addresses")
    suspend fun createAddress(request: AddressRequestDto): AppResult<AddressDto> = apiClient.post("/addresses", request)
    suspend fun updateAddress(uuid: String, request: AddressRequestDto): AppResult<AddressDto> = apiClient.put("/addresses/$uuid", request)
    suspend fun deleteAddress(uuid: String): AppResult<Unit> = apiClient.delete("/addresses/$uuid")
}

@Serializable data class AddressDto(val uuid: String, val label: String, val street: String, val city: String, val building: String?, val floor: String?, val notes: String?, val is_default: Boolean)
@Serializable data class AddressRequestDto(val label: String, val street: String, val city: String, val building: String? = null, val floor: String? = null, val notes: String? = null, val is_default: Boolean = false)

fun AddressDto.toDomain() = Address(uuid, label, street, city, building, floor, notes, is_default)

class AddressRepositoryImpl(private val remote: AddressRemoteDataSource) : AddressRepository {
    override suspend fun getAddresses() = remote.getAddresses().map { list -> list.map { it.toDomain() } }
    override suspend fun createAddress(request: AddressRequest) = remote.createAddress(AddressRequestDto(request.label, request.street, request.city, request.building, request.floor, request.notes, request.is_default)).map { it.toDomain() }
    override suspend fun updateAddress(uuid: String, request: AddressRequest) = remote.updateAddress(uuid, AddressRequestDto(request.label, request.street, request.city, request.building, request.floor, request.notes, request.is_default)).map { it.toDomain() }
    override suspend fun deleteAddress(uuid: String) = remote.deleteAddress(uuid)
}
