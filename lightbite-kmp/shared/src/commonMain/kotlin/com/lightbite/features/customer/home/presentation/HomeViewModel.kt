package com.lightbite.app.features.customer.home.presentation

import com.lightbite.app.core.viewmodel.ViewModel
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
    val sortOption: SortOption = SortOption.RATING,
    val selectedCuisine: String? = null,
    val currentPage: Int = 1,
    val hasMore: Boolean = false,
    val isLoadingMore: Boolean = false,
)

class HomeViewModel(
    private val repository: HomeRepository,
) : ViewModel() {

    private val _screenState = MutableStateFlow<ScreenState<HomeUiState>>(ScreenState.Loading)
    val screenState: StateFlow<ScreenState<HomeUiState>> = _screenState.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _screenState.value = ScreenState.Loading
            repository.getCachedRestaurants()?.let { page ->
                _screenState.value = if (page.restaurants.isEmpty()) ScreenState.Empty
                else ScreenState.Loaded(HomeUiState(
                    restaurants = page.restaurants, hasMore = page.hasMore, currentPage = page.currentPage
                ))
            }
            repository.getRestaurants(page = 1, sort = currentSort(), cuisine = currentCuisine())
                .let { result ->
                    when (result) {
                        is AppResult.Success -> {
                            val data = result.data
                            _screenState.value = if (data.restaurants.isEmpty()) ScreenState.Empty
                            else ScreenState.Loaded(buildState(data))
                        }
                        is AppResult.Failure -> {
                            if (_screenState.value !is ScreenState.Loaded)
                                _screenState.value = ScreenState.Error(result.error.message)
                        }
                    }
                }
        }
    }

    fun loadMore() {
        val state = (_screenState.value as? ScreenState.Loaded)?.data ?: return
        if (state.isLoadingMore || !state.hasMore) return
        viewModelScope.launch {
            _screenState.value = ScreenState.Loaded(state.copy(isLoadingMore = true))
            repository.getRestaurants(page = state.currentPage + 1, sort = currentSort(), cuisine = currentCuisine())
                .let { result ->
                    when (result) {
                        is AppResult.Success -> _screenState.value = ScreenState.Loaded(
                            buildState(result.data, append = true)
                        )
                        is AppResult.Failure -> _screenState.value = ScreenState.Loaded(
                            state.copy(isLoadingMore = false)
                        )
                    }
                }
        }
    }

    fun setSort(sort: SortOption) {
        _screenState.value = (_screenState.value as? ScreenState.Loaded)?.let {
            ScreenState.Loaded(it.data.copy(sortOption = sort))
        } ?: ScreenState.Loaded(HomeUiState(sortOption = sort))
        load()
    }

    fun setCuisine(cuisine: String?) {
        val current = currentCuisine()
        val new = if (cuisine == current) null else cuisine
        _screenState.value = (_screenState.value as? ScreenState.Loaded)?.let {
            ScreenState.Loaded(it.data.copy(selectedCuisine = new))
        } ?: ScreenState.Loaded(HomeUiState(selectedCuisine = new))
        load()
    }

    fun refresh() = load()

    private fun currentSort() = (_screenState.value as? ScreenState.Loaded)?.data?.sortOption ?: SortOption.RATING
    private fun currentCuisine() = (_screenState.value as? ScreenState.Loaded)?.data?.selectedCuisine

    private fun buildState(page: com.lightbite.shared.features.customer.home.domain.RestaurantListPage, append: Boolean = false): HomeUiState {
        val current = (_screenState.value as? ScreenState.Loaded)?.data
        return HomeUiState(
            restaurants = if (append) (current?.restaurants ?: emptyList()) + page.restaurants else page.restaurants,
            sortOption = current?.sortOption ?: SortOption.RATING,
            selectedCuisine = current?.selectedCuisine,
            currentPage = page.currentPage,
            hasMore = page.hasMore,
            isLoadingMore = false,
        )
    }
}
