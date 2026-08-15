package com.lightbite.shared.features.customer.search.data

import com.lightbite.shared.core.api.ApiClient
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.features.customer.home.data.HomeResponse
import com.lightbite.shared.features.customer.home.data.toDomain
import com.lightbite.shared.features.customer.search.domain.SearchResult

class SearchRemoteDataSource(private val apiClient: ApiClient) {
    suspend fun search(query: String, page: Int): AppResult<SearchResult> {
        return apiClient.get<HomeResponse>("/restaurants", mapOf("q" to query, "page" to page.toString()))
            .map { response ->
                SearchResult(
                    items = response.toDomain().restaurants,
                    query = query,
                    total = response.total,
                )
            }
    }
}

class SearchRepositoryImpl(
    private val remote: SearchRemoteDataSource,
) : com.lightbite.shared.features.customer.search.domain.SearchRepository {
    override suspend fun search(query: String, page: Int): AppResult<SearchResult> =
        remote.search(query, page)
}
