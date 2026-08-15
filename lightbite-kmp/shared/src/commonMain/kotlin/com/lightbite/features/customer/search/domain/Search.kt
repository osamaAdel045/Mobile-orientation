package com.lightbite.shared.features.customer.search.domain

import com.lightbite.shared.features.customer.home.domain.Restaurant

data class SearchResult(
    val items: List<Restaurant>,
    val query: String,
    val total: Int,
)

interface SearchRepository {
    suspend fun search(query: String, page: Int = 1): com.lightbite.shared.core.errors.AppResult<SearchResult>
}
