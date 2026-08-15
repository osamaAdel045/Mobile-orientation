package com.lightbite.app.features.auth.presentation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import com.lightbite.shared.features.auth.domain.AuthState
import com.lightbite.app.core.i18n.lbString
import com.lightbite.app.core.i18n.Strings
import com.lightbite.app.core.theme.LightBiteTheme
import com.lightbite.app.core.ui.LBButton
import com.lightbite.app.core.ui.LBButtonVariant
import com.lightbite.app.core.ui.LBInput
import com.lightbite.app.core.ui.LBKeyboardType
import com.lightbite.app.core.ui.LBErrorDisplay
import org.koin.compose.koinInject

/**
 * Login screen.
 *
 * Architecture:
 *   screen → AuthViewModel → AuthRepository → AuthRemoteDataSource → ApiClient
 *
 * Screen is THIN: delegates all logic to ViewModel. No network calls,
 * no storage access, no business logic in this file.
 */
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onNavigateToRegister: () -> Unit,
    viewModel: AuthViewModel = koinInject(),
) {
    val state by viewModel.loginState.collectAsState()
    val authState by viewModel.authState.collectAsState()

    // Navigate on successful login
    LaunchedEffect(authState) {
        if (authState is AuthState.Authenticated) {
            onLoginSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(
                horizontal = LightBiteTheme.spacing.lg,
                vertical = LightBiteTheme.spacing.xl,
            ),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        // Logo / Branding
        Text(
            text = "LightBite",
            style = LightBiteTheme.typography.displayLarge,
            color = LightBiteTheme.colors.primary.`500`,
        )

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.sm))

        Text(
            text = "Welcome back! Enter your details to continue.",
            style = LightBiteTheme.typography.body,
            color = LightBiteTheme.colors.neutral.`400`,
        )

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.xl))

        // General error banner
        state.generalError?.let { error ->
            LBErrorDisplay(
                message = error,
                modifier = Modifier.padding(bottom = LightBiteTheme.spacing.md),
            )
        }

        // Email field
        LBInput(
            value = state.email,
            onValueChange = viewModel::onLoginEmailChanged,
            label = lbString(Strings.auth_email),
            placeholder = "you@example.com",
            error = state.emailError,
            keyboardType = LBKeyboardType.Email,
        )

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.md))

        // Password field
        LBInput(
            value = state.password,
            onValueChange = viewModel::onLoginPasswordChanged,
            label = lbString(Strings.auth_password),
            error = state.passwordError,
            keyboardType = LBKeyboardType.Password,
        )

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.lg))

        // Login button
        LBButton(
            text = lbString(Strings.auth_login),
            onClick = viewModel::login,
            loading = state.isLoading,
        )

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.md))

        // Register link
        LBButton(
            text = lbString(Strings.auth_no_account),
            onClick = onNavigateToRegister,
            variant = LBButtonVariant.Ghost,
        )
    }
}
