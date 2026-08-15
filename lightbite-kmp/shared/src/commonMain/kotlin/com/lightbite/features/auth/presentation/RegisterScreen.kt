package com.lightbite.app.features.auth.presentation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.lightbite.app.core.i18n.lbString
import com.lightbite.app.core.theme.LightBiteTheme
import com.lightbite.app.core.ui.LBButton
import com.lightbite.app.core.ui.LBButtonVariant
import com.lightbite.app.core.ui.LBErrorDisplay
import com.lightbite.app.core.ui.LBInput
import com.lightbite.app.core.ui.LBKeyboardType
import com.lightbite.shared.features.auth.domain.AuthState
import com.lightbite.app.core.i18n.Strings
import org.koin.compose.koinInject

@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit,
    viewModel: AuthViewModel = koinInject(),
) {
    val state by viewModel.registerState.collectAsState()
    val authState by viewModel.authState.collectAsState()

    LaunchedEffect(authState) {
        if (authState is AuthState.Authenticated) {
            onRegisterSuccess()
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
        Text(
            text = lbString(Strings.auth_register_title),
            style = LightBiteTheme.typography.displayLarge,
            color = LightBiteTheme.colors.primary.`500`,
        )

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.sm))

        Text(
            text = lbString(Strings.auth_register_subtitle),
            style = LightBiteTheme.typography.body,
            color = LightBiteTheme.colors.neutral.`400`,
        )

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.xl))

        state.generalError?.let { error ->
            LBErrorDisplay(
                message = error,
                modifier = Modifier.padding(bottom = LightBiteTheme.spacing.md),
            )
        }

        LBInput(
            value = state.name,
            onValueChange = viewModel::onRegisterNameChanged,
            label = lbString(Strings.auth_name),
            error = state.nameError,
            keyboardType = LBKeyboardType.Text,
        )

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.md))

        LBInput(
            value = state.email,
            onValueChange = viewModel::onRegisterEmailChanged,
            label = lbString(Strings.auth_email),
            error = state.emailError,
            keyboardType = LBKeyboardType.Email,
        )

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.md))

        LBInput(
            value = state.phone,
            onValueChange = viewModel::onRegisterPhoneChanged,
            label = lbString(Strings.auth_phone),
            error = state.phoneError,
            keyboardType = LBKeyboardType.Phone,
        )

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.md))

        LBInput(
            value = state.password,
            onValueChange = viewModel::onRegisterPasswordChanged,
            label = lbString(Strings.auth_password),
            error = state.passwordError,
            keyboardType = LBKeyboardType.Password,
        )

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.lg))

        LBButton(
            text = lbString(Strings.auth_register),
            onClick = viewModel::register,
            loading = state.isLoading,
        )

        Spacer(modifier = Modifier.height(LightBiteTheme.spacing.md))

        LBButton(
            text = lbString(Strings.auth_have_account),
            onClick = onNavigateToLogin,
            variant = LBButtonVariant.Ghost,
        )
    }
}
