package com.lightbite.app.features.driver

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.lightbite.app.core.viewmodel.ViewModel
import com.lightbite.app.core.theme.LightBiteTheme
import com.lightbite.app.core.ui.*
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.core.errors.ScreenState
import com.lightbite.shared.features.driver.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
// Koin modules defined in driver/DriverKoinModule.kt

// ═══ Driver Home ═════════════════════════════════════════════════════

class DriverHomeViewModel(private val repo: DriverHomeRepository) : ViewModel() {
    private val _isOnline = MutableStateFlow(false)
    val isOnline: StateFlow<Boolean> = _isOnline.asStateFlow()
    private val _isToggling = MutableStateFlow(false)
    val isToggling = _isToggling.asStateFlow()
    private val _jobOffer = MutableStateFlow<DriverJob?>(null)
    val jobOffer: StateFlow<DriverJob?> = _jobOffer.asStateFlow()
    private val _activeDelivery = MutableStateFlow<ActiveDelivery?>(null)
    val activeDelivery: StateFlow<ActiveDelivery?> = _activeDelivery.asStateFlow()
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init { startPolling() }

    fun toggleOnline() {
        viewModelScope.launch {
            _isToggling.value = true
            _error.value = null
            (if (_isOnline.value) repo.setOffline() else repo.setOnline()).let { result ->
                when (result) {
                    is AppResult.Success -> _isOnline.value = !_isOnline.value
                    is AppResult.Failure -> _error.value = result.error.message
                }
            }
            _isToggling.value = false
        }
    }

    private fun startPolling() {
        viewModelScope.launch {
            while (isActive) {
                if (_isOnline.value) {
                    repo.getActiveDelivery().let { r -> if (r is AppResult.Success) _activeDelivery.value = r.data }
                    repo.getAvailableJob().let { r -> if (r is AppResult.Success) _jobOffer.value = r.data }
                }
                delay(10_000) // Poll every 10s
            }
        }
    }
}

@Composable
fun DriverHomeScreen(
    onJobOffer: (String) -> Unit,
    onActiveDelivery: (String) -> Unit,
    viewModel: DriverHomeViewModel ,
) {
    val isOnline by viewModel.isOnline.collectAsState()
    val isToggling by viewModel.isToggling.collectAsState()
    val jobOffer by viewModel.jobOffer.collectAsState()
    val activeDelivery by viewModel.activeDelivery.collectAsState()
    val error by viewModel.error.collectAsState()

    LaunchedEffect(jobOffer) { jobOffer?.let { onJobOffer(it.orderUuid) } }

    Column(Modifier.fillMaxSize()) {
        LBScreenHeader(title = "Driver Dashboard")

        // Online toggle
        LBButton(
            text = if (isOnline) "Go Offline" else "Go Online",
            onClick = viewModel::toggleOnline,
            loading = isToggling,
            variant = if (isOnline) LBButtonVariant.Danger else LBButtonVariant.Primary,
            modifier = Modifier.padding(LightBiteTheme.spacing.md),
        )

        if (error != null) LBErrorDisplay(message = error!!)

        // Active delivery
        activeDelivery?.let { delivery ->
            LBCard(onClick = { onActiveDelivery(delivery.orderUuid) }) {
                Column(Modifier.padding(LightBiteTheme.spacing.md)) {
                    Text("Active Delivery", style = LightBiteTheme.typography.heading3, color = LightBiteTheme.colors.primary.`500`)
                    Text("${delivery.restaurantName} → ${delivery.customerName}", style = LightBiteTheme.typography.body)
                    Text("Phase: ${delivery.phase}", style = LightBiteTheme.typography.bodySmall)
                }
            }
        }
    }
}

// ═══ Driver Job ══════════════════════════════════════════════════════

class DriverJobViewModel(private val repo: DriverJobRepository) : ViewModel() {
    private val _isAccepting = MutableStateFlow(false); val isAccepting = _isAccepting.asStateFlow()
    private val _isDeclining = MutableStateFlow(false); val isDeclining = _isDeclining.asStateFlow()
    private val _error = MutableStateFlow<String?>(null); val error = _error.asStateFlow()

    fun accept(orderUuid: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isAccepting.value = true; _error.value = null
            repo.acceptJob(orderUuid).let { r ->
                if (r.isSuccess) onSuccess() else _error.value = (r as AppResult.Failure).error.message
            }
            _isAccepting.value = false
        }
    }

    fun decline(orderUuid: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isDeclining.value = true
            repo.declineJob(orderUuid).let { r -> if (r.isSuccess) onSuccess() else _error.value = (r as AppResult.Failure).error.message }
            _isDeclining.value = false
        }
    }
}

@Composable
fun DriverJobScreen(
    jobUuid: String,
    onAccepted: () -> Unit,
    onDeclined: () -> Unit,
    onBack: () -> Unit,
    viewModel: DriverJobViewModel ,
) {
    val error by viewModel.error.collectAsState()

    Column(Modifier.fillMaxSize()) {
        LBScreenHeader(title = "New Delivery Request", onBack = onBack)
        if (error != null) LBErrorDisplay(message = error!!)
        Column(Modifier.padding(LightBiteTheme.spacing.md)) {
            Text("You have a new delivery request!", style = LightBiteTheme.typography.heading2)
            Spacer(Modifier.height(LightBiteTheme.spacing.lg))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(LightBiteTheme.spacing.md)) {
                LBButton(text = "Accept", onClick = { viewModel.accept(jobUuid, onAccepted) }, loading = viewModel.isAccepting.collectAsState().value, modifier = Modifier.weight(1f))
                LBButton(text = "Decline", onClick = { viewModel.decline(jobUuid, onDeclined) }, loading = viewModel.isDeclining.collectAsState().value, variant = LBButtonVariant.Outline, modifier = Modifier.weight(1f))
            }
        }
    }
}

// ═══ Driver Delivery ═════════════════════════════════════════════════

class DriverDeliveryViewModel(private val repo: DriverDeliveryRepository) : ViewModel() {
    private val _isLoading = MutableStateFlow(false); val isLoading = _isLoading.asStateFlow()
    private val _completedEarnings = MutableStateFlow<DriverEarnings?>(null); val completedEarnings = _completedEarnings.asStateFlow()
    private val _error = MutableStateFlow<String?>(null); val error = _error.asStateFlow()

    fun confirmPickup(uuid: String) { viewModelScope.launch { _isLoading.value = true; repo.confirmPickup(uuid); _isLoading.value = false } }
    fun startDelivery(uuid: String) { viewModelScope.launch { _isLoading.value = true; repo.startDelivery(uuid); _isLoading.value = false } }
    fun confirmDelivery(uuid: String) { viewModelScope.launch {
        _isLoading.value = true
        repo.confirmDelivery(uuid).let { r -> if (r is AppResult.Success) _completedEarnings.value = r.data else _error.value = (r as AppResult.Failure).error.message }
        _isLoading.value = false
    }}
}

@Composable
fun DriverDeliveryScreen(
    orderUuid: String,
    phase: String,
    onBack: () -> Unit,
    viewModel: DriverDeliveryViewModel ,
) {
    val completedEarnings by viewModel.completedEarnings.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    if (completedEarnings != null) {
        Column(Modifier.fillMaxSize().padding(LightBiteTheme.spacing.xl), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Text("🎉", style = LightBiteTheme.typography.displayLarge)
            Text("Delivery Complete!", style = LightBiteTheme.typography.heading1)
            Text("Earnings: SAR ${completedEarnings!!.today}", style = LightBiteTheme.typography.body)
            Spacer(Modifier.height(LightBiteTheme.spacing.lg))
            LBButton(text = "Back to Home", onClick = onBack)
        }
        return
    }

    Column(Modifier.fillMaxSize()) {
        LBScreenHeader(title = "Delivery", onBack = onBack)
        Column(Modifier.padding(LightBiteTheme.spacing.md)) {
            when (phase) {
                "pickup" -> LBButton(text = "Confirm Pickup", onClick = { viewModel.confirmPickup(orderUuid) }, loading = isLoading)
                "picked_up" -> LBButton(text = "Start Delivery", onClick = { viewModel.startDelivery(orderUuid) }, loading = isLoading)
                "in_transit" -> LBButton(text = "Confirm Delivery", onClick = { viewModel.confirmDelivery(orderUuid) }, loading = isLoading)
            }
        }
    }
}

// ═══ Driver Earnings ═════════════════════════════════════════════════

class DriverEarningsViewModel(private val repo: DriverEarningsRepository) : ViewModel() {
    private val _screenState = MutableStateFlow<ScreenState<DriverEarnings>>(ScreenState.Loading)
    val screenState: StateFlow<ScreenState<DriverEarnings>> = _screenState.asStateFlow()
    init { load() }
    fun load() { viewModelScope.launch {
        _screenState.value = ScreenState.Loading
        repo.getCachedEarnings()?.let { _screenState.value = ScreenState.Loaded(it) }
        repo.getEarnings().let { r -> when (r) { is AppResult.Success -> _screenState.value = ScreenState.Loaded(r.data); is AppResult.Failure -> _screenState.value = ScreenState.Error(r.error.message) } }
    }}
}

@Composable
fun DriverEarningsScreen(viewModel: DriverEarningsViewModel ) {
    val state by viewModel.screenState.collectAsState()
    Column(Modifier.fillMaxSize()) {
        LBScreenHeader(title = "Earnings")
        when (val s = state) {
            is ScreenState.Loading -> Column(Modifier.padding(LightBiteTheme.spacing.md)) { repeat(3) { LBSkeleton(height = LightBiteTheme.spacing.lg * 3) } }
            is ScreenState.Loaded -> Column(Modifier.padding(LightBiteTheme.spacing.md)) {
                Text("Today: SAR ${s.data.today}", style = LightBiteTheme.typography.heading2, color = LightBiteTheme.colors.primary.`500`)
                Text("This Week: SAR ${s.data.thisWeek}", style = LightBiteTheme.typography.body)
                Text("Total Trips: ${s.data.totalTrips}", style = LightBiteTheme.typography.body)
                Text("Total Earnings: SAR ${s.data.totalEarnings}", style = LightBiteTheme.typography.body)
                s.data.rating?.let { Text("Rating: ⭐ $it", style = LightBiteTheme.typography.body) }
            }
            is ScreenState.Empty -> LBEmptyState(title = "No earnings data")
            is ScreenState.Error -> LBErrorDisplay(message = s.message, onRetry = viewModel::load)
        }
    }
}

// ═══ Driver History ══════════════════════════════════════════════════

class DriverHistoryViewModel(private val repo: DriverHistoryRepository) : ViewModel() {
    private val _screenState = MutableStateFlow<ScreenState<List<DriverOrder>>>(ScreenState.Loading)
    val screenState = _screenState.asStateFlow()
    init { load() }
    fun load() {
        viewModelScope.launch {
            _screenState.value = ScreenState.Loading
            when (val r = repo.getOrders()) {
                is AppResult.Success -> _screenState.value = if (r.data.isEmpty()) ScreenState.Empty else ScreenState.Loaded(r.data)
                is AppResult.Failure -> _screenState.value = ScreenState.Error(r.error.message)
            }
        }
    }
}

@Composable
fun DriverHistoryScreen(viewModel: DriverHistoryViewModel) {
    val state by viewModel.screenState.collectAsState()
    Column(Modifier.fillMaxSize()) {
        LBScreenHeader(title = "Order History")
        when (val s = state) {
            is ScreenState.Loading -> Column(Modifier.padding(LightBiteTheme.spacing.md)) { repeat(5) { LBSkeleton(height = LightBiteTheme.spacing.lg * 2) } }
            is ScreenState.Loaded -> LazyColumn(contentPadding = PaddingValues(LightBiteTheme.spacing.md), verticalArrangement = Arrangement.spacedBy(LightBiteTheme.spacing.sm)) { items(s.data, key = { it.uuid }) { o ->
                LBCard { Row(Modifier.padding(LightBiteTheme.spacing.md)) { Column(Modifier.weight(1f)) { Text(o.restaurantName, style = LightBiteTheme.typography.heading3); Text("SAR ${o.earnings}", style = LightBiteTheme.typography.bodySmall) }; LBStatusBadge(status = o.status) } }
            }}
            is ScreenState.Empty -> LBEmptyState(title = "No completed orders")
            is ScreenState.Error -> LBErrorDisplay(message = s.message, onRetry = viewModel::load)
        }
    }
}
