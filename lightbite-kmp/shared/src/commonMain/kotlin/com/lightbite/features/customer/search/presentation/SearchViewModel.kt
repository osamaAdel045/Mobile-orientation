package com.lightbite.app.features.customer.search.presentation

import com.lightbite.app.core.viewmodel.ViewModel
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.core.errors.ScreenState
import com.lightbite.shared.features.customer.home.domain.Restaurant
import com.lightbite.shared.features.customer.search.domain.SearchRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SearchViewModel(
    private val repository: SearchRepository,
) : ViewModel() {

    private val _screenState = MutableStateFlow<ScreenState<List<Restaurant>>>(ScreenState.Empty)
    val screenState: StateFlow<ScreenState<List<Restaurant>>> = _screenState.asStateFlow()

    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query.asStateFlow()

    private var debounceJob: Job? = null

    fun onQueryChanged(query: String) {
        _query.value = query
        debounceJob?.cancel()
        if (query.isBlank()) {
            _screenState.value = ScreenState.Empty
            return
        }
        debounceJob = viewModelScope.launch {
            delay(300) // debounce
            search(query)
        }
    }

    private suspend fun search(query: String) {
        _screenState.value = ScreenState.Loading
        repository.search(query).let { result ->
            when (result) {
                is AppResult.Success -> _screenState.value =
                    if (result.data.items.isEmpty()) ScreenState.Empty
                    else ScreenState.Loaded(result.data.items)
                is AppResult.Failure -> _screenState.value = ScreenState.Error(result.error.message)
            }
        }
    }
}
