package com.lightbite.app.features.customer.restaurant.presentation

import com.lightbite.app.core.viewmodel.ViewModel
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.core.errors.ScreenState
import com.lightbite.shared.features.customer.restaurant.domain.MenuItem
import com.lightbite.shared.features.customer.restaurant.domain.RestaurantDetail
import com.lightbite.shared.features.customer.restaurant.domain.RestaurantRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class RestaurantViewModel(
    private val repository: RestaurantRepository,
) : ViewModel() {

    private val _screenState = MutableStateFlow<ScreenState<RestaurantDetail>>(ScreenState.Loading)
    val screenState: StateFlow<ScreenState<RestaurantDetail>> = _screenState.asStateFlow()

    private val _selectedMenuItem = MutableStateFlow<MenuItem?>(null)
    val selectedMenuItem: StateFlow<MenuItem?> = _selectedMenuItem.asStateFlow()

    fun load(uuid: String) {
        viewModelScope.launch {
            _screenState.value = ScreenState.Loading
            repository.getCachedDetail(uuid)?.let {
                _screenState.value = ScreenState.Loaded(it)
            }
            repository.getRestaurantDetail(uuid).let { result ->
                when (result) {
                    is AppResult.Success -> _screenState.value = ScreenState.Loaded(result.data)
                    is AppResult.Failure -> {
                        if (_screenState.value !is ScreenState.Loaded)
                            _screenState.value = ScreenState.Error(result.error.message)
                    }
                }
            }
        }
    }

    fun selectMenuItem(item: MenuItem?) { _selectedMenuItem.value = item }
    fun clearSelection() { _selectedMenuItem.value = null }
}
