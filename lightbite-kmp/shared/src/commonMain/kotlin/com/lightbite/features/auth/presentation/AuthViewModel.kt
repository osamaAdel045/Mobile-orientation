package com.lightbite.app.features.auth.presentation

import com.lightbite.app.core.viewmodel.ViewModel
import com.lightbite.shared.core.errors.AppError
import com.lightbite.shared.core.errors.AppResult
import com.lightbite.shared.core.errors.ScreenState
import com.lightbite.shared.features.auth.domain.AuthRepository
import com.lightbite.shared.features.auth.domain.AuthState
import com.lightbite.shared.features.auth.domain.LoginCredentials
import com.lightbite.shared.features.auth.domain.RegisterCredentials
import com.lightbite.shared.features.auth.domain.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Global auth ViewModel — manages authentication state for the entire app.
 *
 * Exposes:
 *   - authState: StateFlow<AuthState> — checked by App.kt root composable
 *   - loginScreenState: StateFlow<LoginUiState> — for LoginScreen
 *   - registerScreenState: StateFlow<RegisterUiState> — for RegisterScreen
 *
 * Persistence: auth state is rehydrated from SecureStorage on init
 *              via AuthRepository.checkAuth(). This is the "persistence
 *              from day one" pattern — app restart restores the session.
 */
class AuthViewModel(
    private val authRepo: AuthRepository,
) : ViewModel() {

    // ── Global Auth State (for App.kt routing) ─────────────────────────

    private val _authState = MutableStateFlow<AuthState>(AuthState.Loading)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    // ── Login Screen State ─────────────────────────────────────────────

    private val _loginState = MutableStateFlow(LoginUiState())
    val loginState: StateFlow<LoginUiState> = _loginState.asStateFlow()

    // ── Register Screen State ──────────────────────────────────────────

    private val _registerState = MutableStateFlow(RegisterUiState())
    val registerState: StateFlow<RegisterUiState> = _registerState.asStateFlow()

    init {
        checkAuth()
    }

    // ── Auth Check ─────────────────────────────────────────────────────

    fun checkAuth() {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            _authState.value = authRepo.checkAuth()
        }
    }

    // ── Login ──────────────────────────────────────────────────────────

    fun onLoginEmailChanged(email: String) {
        _loginState.value = _loginState.value.copy(
            email = email,
            emailError = null,
            generalError = null,
        )
    }

    fun onLoginPasswordChanged(password: String) {
        _loginState.value = _loginState.value.copy(
            password = password,
            passwordError = null,
            generalError = null,
        )
    }

    fun login() {
        val state = _loginState.value
        val emailError = validateEmail(state.email)
        val passwordError = validatePassword(state.password)

        if (emailError != null || passwordError != null) {
            _loginState.value = state.copy(
                emailError = emailError,
                passwordError = passwordError,
            )
            return
        }

        viewModelScope.launch {
            _loginState.value = state.copy(isLoading = true, generalError = null)

            when (val result = authRepo.login(
                LoginCredentials(email = state.email, password = state.password)
            )) {
                is AppResult.Success -> {
                    _loginState.value = _loginState.value.copy(isLoading = false)
                    _authState.value = AuthState.Authenticated(result.data)
                }
                is AppResult.Failure -> {
                    _loginState.value = _loginState.value.copy(
                        isLoading = false,
                        generalError = mapAuthError(result.error),
                    )
                }
            }
        }
    }

    // ── Register ───────────────────────────────────────────────────────

    fun onRegisterNameChanged(name: String) {
        _registerState.value = _registerState.value.copy(
            name = name,
            nameError = null,
            generalError = null,
        )
    }

    fun onRegisterEmailChanged(email: String) {
        _registerState.value = _registerState.value.copy(
            email = email,
            emailError = null,
            generalError = null,
        )
    }

    fun onRegisterPhoneChanged(phone: String) {
        _registerState.value = _registerState.value.copy(
            phone = phone,
            phoneError = null,
            generalError = null,
        )
    }

    fun onRegisterPasswordChanged(password: String) {
        _registerState.value = _registerState.value.copy(
            password = password,
            passwordError = null,
            generalError = null,
        )
    }

    fun register() {
        val state = _registerState.value
        val nameError = if (state.name.isBlank()) "Name is required" else null
        val emailError = validateEmail(state.email)
        val phoneError = if (state.phone.isBlank()) "Phone is required" else null
        val passwordError = validatePassword(state.password)

        if (listOf(nameError, emailError, phoneError, passwordError).any { it != null }) {
            _registerState.value = state.copy(
                nameError = nameError,
                emailError = emailError,
                phoneError = phoneError,
                passwordError = passwordError,
            )
            return
        }

        viewModelScope.launch {
            _registerState.value = state.copy(isLoading = true, generalError = null)

            when (val result = authRepo.register(
                RegisterCredentials(
                    name = state.name,
                    email = state.email,
                    password = state.password,
                    phone = state.phone,
                )
            )) {
                is AppResult.Success -> {
                    _registerState.value = _registerState.value.copy(isLoading = false)
                    _authState.value = AuthState.Authenticated(result.data)
                }
                is AppResult.Failure -> {
                    _registerState.value = _registerState.value.copy(
                        isLoading = false,
                        generalError = mapAuthError(result.error),
                    )
                }
            }
        }
    }

    // ── Logout ─────────────────────────────────────────────────────────

    fun logout() {
        viewModelScope.launch {
            authRepo.logout()
            _authState.value = AuthState.Unauthenticated
            _loginState.value = LoginUiState()
            _registerState.value = RegisterUiState()
        }
    }

    // ── Validation ─────────────────────────────────────────────────────

    private fun validateEmail(email: String): String? = when {
        email.isBlank() -> "Email is required"
        !email.contains("@") || !email.contains(".") -> "Enter a valid email"
        else -> null
    }

    private fun validatePassword(password: String): String? = when {
        password.isBlank() -> "Password is required"
        password.length < 6 -> "Password must be at least 6 characters"
        else -> null
    }

    private fun mapAuthError(error: AppError): String = when (error) {
        is AppError.Unauthorized -> "Invalid email or password"
        is AppError.ValidationError -> error.errors.values.flatten().firstOrNull()
            ?: error.message
        is AppError.NetworkError -> "No internet connection. Please try again."
        else -> error.message
    }
}

// ── UI State Classes ────────────────────────────────────────────────────

data class LoginUiState(
    val email: String = "",
    val emailError: String? = null,
    val password: String = "",
    val passwordError: String? = null,
    val isLoading: Boolean = false,
    val generalError: String? = null,
)

data class RegisterUiState(
    val name: String = "",
    val nameError: String? = null,
    val email: String = "",
    val emailError: String? = null,
    val phone: String = "",
    val phoneError: String? = null,
    val password: String = "",
    val passwordError: String? = null,
    val isLoading: Boolean = false,
    val generalError: String? = null,
)
