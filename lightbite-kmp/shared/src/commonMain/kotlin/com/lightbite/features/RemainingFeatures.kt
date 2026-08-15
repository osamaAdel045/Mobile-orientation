package com.lightbite.app.features

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.lightbite.app.core.viewmodel.ViewModel
import com.lightbite.app.core.i18n.lbString
import com.lightbite.app.core.theme.LightBiteTheme
import com.lightbite.app.core.ui.*
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.core.errors.ScreenState
import com.lightbite.shared.features.customer.address.domain.*
import com.lightbite.shared.features.customer.rate_order.domain.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// ═══ Rate Order ═══════════════════════════════════════════════════════

class RateOrderViewModel(private val repo: RateOrderRepository) : ViewModel() {
    private val _rating = MutableStateFlow(0)
    val rating: StateFlow<Int> = _rating.asStateFlow()
    private val _comment = MutableStateFlow("")
    val comment: StateFlow<String> = _comment.asStateFlow()
    private val _isSubmitting = MutableStateFlow(false)
    val isSubmitting = _isSubmitting.asStateFlow()
    private val _result = MutableStateFlow<Boolean?>(null)
    val result: StateFlow<Boolean?> = _result.asStateFlow()

    fun setRating(r: Int) { _rating.value = r }
    fun setComment(c: String) { _comment.value = c }

    fun submit(orderUuid: String) {
        viewModelScope.launch {
            _isSubmitting.value = true
            repo.submitRating(orderUuid, _rating.value, _comment.value.ifBlank { null }).let { r ->
                _isSubmitting.value = false
                _result.value = r.isSuccess
            }
        }
    }
}

@Composable
fun RateOrderScreen(orderUuid: String, onComplete: () -> Unit, onBack: () -> Unit, viewModel: RateOrderViewModel = org.koin.compose.koinInject<RateOrderViewModel>()) {
    val rating by viewModel.rating.collectAsState()
    val isSubmitting by viewModel.isSubmitting.collectAsState()
    val result by viewModel.result.collectAsState()

    LaunchedEffect(result) { if (result == true) onComplete() }

    Column(Modifier.fillMaxSize()) {
        LBScreenHeader(title = "Rate Order", onBack = onBack)
        Column(Modifier.padding(LightBiteTheme.spacing.md)) {
            Text("How was your order?", style = LightBiteTheme.typography.heading2)
            Spacer(Modifier.height(LightBiteTheme.spacing.md))
            // Star rating
            Row { (1..5).forEach { i ->
                Text(text = if (i <= rating) "★" else "☆", style = LightBiteTheme.typography.displayLarge,
                    color = if (i <= rating) LightBiteTheme.colors.primary.`500` else LightBiteTheme.colors.neutral.`300`,
                    modifier = Modifier.padding(end = LightBiteTheme.spacing.sm))
            }}
            Spacer(Modifier.height(LightBiteTheme.spacing.md))
            LBInput(value = viewModel.comment.collectAsState().value, onValueChange = viewModel::setComment, label = "Comment (optional)", multiline = true)
            Spacer(Modifier.height(LightBiteTheme.spacing.lg))
            LBButton(text = "Submit", onClick = { viewModel.submit(orderUuid) }, loading = isSubmitting, enabled = rating > 0)
        }
    }
}

// ═══ Address ═══════════════════════════════════════════════════════════

class AddressViewModel(private val repo: AddressRepository) : ViewModel() {
    private val _screenState = MutableStateFlow<ScreenState<List<Address>>>(ScreenState.Loading)
    val screenState: StateFlow<ScreenState<List<Address>>> = _screenState.asStateFlow()
    private val _isDeleting = MutableStateFlow<String?>(null)

    init { load() }

    fun load() {
        viewModelScope.launch {
            _screenState.value = ScreenState.Loading
            repo.getAddresses().let { result ->
                when (result) {
                    is AppResult.Success -> _screenState.value = if (result.data.isEmpty()) ScreenState.Empty else ScreenState.Loaded(result.data)
                    is AppResult.Failure -> _screenState.value = ScreenState.Error(result.error.message)
                }
            }
        }
    }

    fun delete(uuid: String) {
        viewModelScope.launch {
            _isDeleting.value = uuid
            repo.deleteAddress(uuid)
            _isDeleting.value = null
            load()
        }
    }
}

@Composable
fun AddressListScreen(
    onAdd: () -> Unit,
    onEdit: (String) -> Unit,
    viewModel: AddressViewModel = org.koin.compose.koinInject<AddressViewModel>(),
) {
    val screenState by viewModel.screenState.collectAsState()

    Column(Modifier.fillMaxSize()) {
        LBScreenHeader(title = "My Addresses")
        when (val state = screenState) {
            is ScreenState.Loading -> Column(Modifier.padding(LightBiteTheme.spacing.md)) { repeat(3) { LBSkeleton(height = LightBiteTheme.spacing.lg * 2) } }
            is ScreenState.Loaded -> LazyColumn(contentPadding = PaddingValues(LightBiteTheme.spacing.md)) {
                items(state.data, key = { it.uuid }) { addr ->
                    LBCard {
                        Column(Modifier.padding(LightBiteTheme.spacing.md)) {
                            Row(horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(addr.label.uppercase(), style = LightBiteTheme.typography.caption, color = LightBiteTheme.colors.primary.`500`)
                                if (addr.isDefault) Text("Default", style = LightBiteTheme.typography.caption, color = LightBiteTheme.colors.semantic.success)
                            }
                            Text("${addr.street}, ${addr.city}", style = LightBiteTheme.typography.body)
                            addr.building?.let { Text("Building $it", style = LightBiteTheme.typography.bodySmall) }
                        }
                    }
                }
            }
            is ScreenState.Empty -> LBEmptyState(title = "No saved addresses", actionLabel = "Add Address", onAction = onAdd)
            is ScreenState.Error -> LBErrorDisplay(message = state.message, onRetry = viewModel::load)
        }
        LBButton(text = "Add New Address", onClick = onAdd, modifier = Modifier.padding(LightBiteTheme.spacing.md))
    }
}

@Composable
fun ProfileScreen(onLogout: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(LightBiteTheme.spacing.md)) {
        LBScreenHeader(title = "Profile")
        LBButton(text = "Log Out", onClick = onLogout, variant = LBButtonVariant.Danger)
    }
}
