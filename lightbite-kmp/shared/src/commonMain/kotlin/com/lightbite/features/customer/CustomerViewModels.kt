package com.lightbite.app.features.customer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.core.errors.ScreenState
import com.lightbite.shared.features.customer.home.domain.HomeRepository
import com.lightbite.shared.features.customer.home.domain.Restaurant
import com.lightbite.shared.features.customer.home.domain.SortOption
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val restaurants: List<Restaurant> = emptyList(),
    val sort: SortOption = SortOption.RATING,
    val loading: Boolean = false,
)

class HomeViewModel(private val repo: HomeRepository) : ViewModel() {
    private val _state = MutableStateFlow(HomeUiState(loading = true))
    val state: StateFlow<HomeUiState> = _state.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(loading = true)
            repo.getRestaurants(sort = _state.value.sort).let { result ->
                when (result) {
                    is AppResult.Success -> _state.value = HomeUiState(
                        restaurants = result.data.restaurants,
                        sort = _state.value.sort,
                    )
                    is AppResult.Failure -> _state.value = _state.value.copy(loading = false)
                }
            }
        }
    }
}
