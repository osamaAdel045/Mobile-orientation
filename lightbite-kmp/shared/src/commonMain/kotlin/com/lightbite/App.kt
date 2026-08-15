package com.lightbite.app

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lightbite.app.core.theme.LightBiteTheme
import com.lightbite.shared.features.auth.domain.AuthState
import com.lightbite.app.features.auth.presentation.AuthViewModel
import com.lightbite.shared.features.auth.domain.UserRole
import org.koin.compose.koinInject

// ── Navigation ─────────────────────────────────────────────────────

sealed class Screen {
    data object Login : Screen()
    data object CustomerHome : Screen()
    data object DriverHome : Screen()
}

@Composable
fun LightBiteApp() {
    val authViewModel: AuthViewModel = koinInject()
    val authState by authViewModel.authState.collectAsState()
    var screen by remember { mutableStateOf<Screen>(Screen.Login) }

    // React to auth state changes
    LaunchedEffect(authState) {
        when (authState) {
            is AuthState.Authenticated -> {
                screen = when ((authState as AuthState.Authenticated).user.role) {
                    UserRole.CUSTOMER -> Screen.CustomerHome
                    UserRole.DRIVER -> Screen.DriverHome
                    UserRole.ADMIN -> Screen.CustomerHome
                }
            }
            is AuthState.Unauthenticated -> screen = Screen.Login
            else -> {}
        }
    }

    LightBiteTheme {
        when (screen) {
            is Screen.Login -> LoginScreen(authViewModel)
            is Screen.CustomerHome -> CustomerHomeScreen(authViewModel)
            is Screen.DriverHome -> DriverHomeScreen(authViewModel)
        }
    }
}

// ── Login ──────────────────────────────────────────────────────────

@Composable
private fun LoginScreen(viewModel: AuthViewModel) {
    val loginState by viewModel.loginState.collectAsState()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("LightBite", style = MaterialTheme.typography.headlineLarge,
            color = MaterialTheme.colorScheme.primary)
        Spacer(Modifier.height(8.dp))
        Text("Welcome back!", style = MaterialTheme.typography.bodyLarge)
        Spacer(Modifier.height(24.dp))

        if (loginState.generalError != null) {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)) {
                Text(loginState.generalError!!, modifier = Modifier.padding(16.dp),
                    color = MaterialTheme.colorScheme.onErrorContainer)
            }
            Spacer(Modifier.height(8.dp))
        }

        OutlinedTextField(
            value = email,
            onValueChange = { email = it; viewModel.onLoginEmailChanged(it) },
            label = { Text("Email") },
            isError = loginState.emailError != null,
            supportingText = loginState.emailError?.let { { Text(it) } },
            modifier = Modifier.fillMaxWidth().padding(horizontal = 32.dp)
        )
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            value = password,
            onValueChange = { password = it; viewModel.onLoginPasswordChanged(it) },
            label = { Text("Password") },
            isError = loginState.passwordError != null,
            supportingText = loginState.passwordError?.let { { Text(it) } },
            modifier = Modifier.fillMaxWidth().padding(horizontal = 32.dp)
        )
        Spacer(Modifier.height(16.dp))
        Button(
            onClick = { viewModel.login() },
            modifier = Modifier.fillMaxWidth().padding(horizontal = 32.dp),
            enabled = !loginState.isLoading && email.isNotBlank() && password.isNotBlank()
        ) {
            if (loginState.isLoading) CircularProgressIndicator(Modifier.size(20.dp), color = MaterialTheme.colorScheme.onPrimary)
            else Text("Log In")
        }
        Spacer(Modifier.height(8.dp))
        TextButton(onClick = { /* TODO: Register */ }) {
            Text("Don't have an account? Sign Up")
        }
    }
}

// ── Customer Home ──────────────────────────────────────────────────

@Composable
private fun CustomerHomeScreen(authViewModel: AuthViewModel) {
    val authState by authViewModel.authState.collectAsState()
    val user = (authState as? AuthState.Authenticated)?.user

    Column(modifier = Modifier.fillMaxSize()) {
        // Top bar
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("LightBite", style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary)
            Row {
                TextButton(onClick = { /* TODO: Profile */ }) {
                    Text(user?.name ?: "")
                }
                TextButton(onClick = { authViewModel.logout() }) {
                    Text("Logout")
                }
            }
        }

        // Restaurant list placeholder
        LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(8) { index ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Restaurant ${index + 1}", style = MaterialTheme.typography.titleMedium)
                        Spacer(Modifier.height(4.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            Text("⭐ 4.5", style = MaterialTheme.typography.bodySmall)
                            Text("🍔 Burgers", style = MaterialTheme.typography.bodySmall)
                            Text("25-35 min", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}

// ── Driver Home ────────────────────────────────────────────────────

@Composable
private fun DriverHomeScreen(authViewModel: AuthViewModel) {
    val authState by authViewModel.authState.collectAsState()
    val user = (authState as? AuthState.Authenticated)?.user

    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Driver Dashboard", style = MaterialTheme.typography.headlineMedium)
            TextButton(onClick = { authViewModel.logout() }) { Text("Logout") }
        }
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text("Welcome, ${user?.name}!", style = MaterialTheme.typography.headlineSmall)
            Spacer(Modifier.height(8.dp))
            Text("You are online and ready to receive orders",
                style = MaterialTheme.typography.bodyLarge)
            Spacer(Modifier.height(24.dp))
            Button(onClick = { /* TODO: Toggle online */ }) {
                Text("Go Online")
            }
        }
    }
}
