package com.lightbite.app.core.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.lightbite.app.core.theme.LightBiteTheme

// ── Button ──────────────────────────────────────────────────────────────

enum class LBButtonVariant { Primary, Secondary, Outline, Danger, Ghost }

@Composable
fun LBButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: LBButtonVariant = LBButtonVariant.Primary,
    enabled: Boolean = true,
    loading: Boolean = false,
    fullWidth: Boolean = true,
) {
    val colors = when (variant) {
        LBButtonVariant.Primary -> ButtonDefaults.buttonColors(
            containerColor = LightBiteTheme.colors.primary.`500`,
            contentColor = Color.White,
        )
        LBButtonVariant.Secondary -> ButtonDefaults.buttonColors(
            containerColor = LightBiteTheme.colors.neutral.`100`,
            contentColor = LightBiteTheme.colors.neutral.`900`,
        )
        LBButtonVariant.Outline -> ButtonDefaults.outlinedButtonColors(
            contentColor = LightBiteTheme.colors.primary.`500`,
        )
        LBButtonVariant.Danger -> ButtonDefaults.buttonColors(
            containerColor = LightBiteTheme.colors.semantic.error,
            contentColor = Color.White,
        )
        LBButtonVariant.Ghost -> ButtonDefaults.textButtonColors(
            contentColor = LightBiteTheme.colors.primary.`500`,
        )
    }

    val baseModifier = if (fullWidth) modifier.fillMaxWidth() else modifier

    when (variant) {
        LBButtonVariant.Outline -> OutlinedButton(
            onClick = onClick,
            modifier = baseModifier,
            enabled = enabled && !loading,
            shape = RoundedCornerShape(LightBiteTheme.radius.md),
            colors = colors,
            contentPadding = PaddingValues(
                vertical = LightBiteTheme.spacing.md,
                horizontal = LightBiteTheme.spacing.lg,
            ),
        ) {
            if (loading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = LightBiteTheme.colors.primary.`500`,
                    strokeWidth = 2.dp,
                )
            } else {
                Text(text = text, style = LightBiteTheme.typography.button)
            }
        }
        LBButtonVariant.Ghost -> TextButton(
            onClick = onClick,
            modifier = baseModifier,
            enabled = enabled,
            colors = colors,
        ) {
            Text(text = text, style = LightBiteTheme.typography.button)
        }
        else -> Button(
            onClick = onClick,
            modifier = baseModifier,
            enabled = enabled && !loading,
            shape = RoundedCornerShape(LightBiteTheme.radius.md),
            colors = colors,
            contentPadding = PaddingValues(
                vertical = LightBiteTheme.spacing.md,
                horizontal = LightBiteTheme.spacing.lg,
            ),
        ) {
            if (loading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = Color.White,
                    strokeWidth = 2.dp,
                )
                Spacer(modifier = Modifier.width(LightBiteTheme.spacing.sm))
            }
            Text(text = text, style = LightBiteTheme.typography.button)
        }
    }
}

// ── Card ────────────────────────────────────────────────────────────────

@Composable
@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
fun LBCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        onClick = onClick ?: {},
        enabled = onClick != null,
        shape = RoundedCornerShape(LightBiteTheme.radius.md),
        colors = CardDefaults.cardColors(
            containerColor = LightBiteTheme.colors.neutral.`0`,
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = LightBiteTheme.shadows.sm),
    ) {
        content()
    }
}

// ── Input ────────────────────────────────────────────────────────────────

@Composable
fun LBInput(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    placeholder: String? = null,
    error: String? = null,
    enabled: Boolean = true,
    readOnly: Boolean = false,
    keyboardType: LBKeyboardType = LBKeyboardType.Text,
    multiline: Boolean = false,
    maxLines: Int = if (multiline) 5 else 1,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier.fillMaxWidth(),
        label = label?.let { { Text(it) } },
        placeholder = placeholder?.let { { Text(it) } },
        isError = error != null,
        supportingText = error?.let { { Text(it, color = LightBiteTheme.colors.semantic.error) } },
        enabled = enabled,
        readOnly = readOnly,
        singleLine = !multiline,
        maxLines = maxLines,
        shape = RoundedCornerShape(LightBiteTheme.radius.md),
        colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
            focusedBorderColor = LightBiteTheme.colors.primary.`500`,
            unfocusedBorderColor = LightBiteTheme.colors.neutral.`200`,
            errorBorderColor = LightBiteTheme.colors.semantic.error,
        ),
        textStyle = LightBiteTheme.typography.body,
    )
}

enum class LBKeyboardType { Text, Email, Password, Number, Phone }

// ── Empty State ─────────────────────────────────────────────────────────

@Composable
fun LBEmptyState(
    title: String,
    subtitle: String? = null,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(LightBiteTheme.spacing.xl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = title,
            style = LightBiteTheme.typography.heading3,
            color = LightBiteTheme.colors.neutral.`700`,
            textAlign = TextAlign.Center,
        )
        if (subtitle != null) {
            Spacer(modifier = Modifier.height(LightBiteTheme.spacing.sm))
            Text(
                text = subtitle,
                style = LightBiteTheme.typography.bodySmall,
                color = LightBiteTheme.colors.neutral.`400`,
                textAlign = TextAlign.Center,
            )
        }
        if (actionLabel != null && onAction != null) {
            Spacer(modifier = Modifier.height(LightBiteTheme.spacing.lg))
            LBButton(
                text = actionLabel,
                onClick = onAction,
                variant = LBButtonVariant.Outline,
                fullWidth = false,
            )
        }
    }
}

// ── Error Display ───────────────────────────────────────────────────────

@Composable
fun LBErrorDisplay(
    message: String,
    onRetry: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(LightBiteTheme.spacing.xl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = message,
            style = LightBiteTheme.typography.body,
            color = LightBiteTheme.colors.semantic.error,
            textAlign = TextAlign.Center,
        )
        if (onRetry != null) {
            Spacer(modifier = Modifier.height(LightBiteTheme.spacing.md))
            LBButton(
                text = "Try Again", // FIXME: stringResource(R.string.common_retry)
                onClick = onRetry,
                variant = LBButtonVariant.Outline,
                fullWidth = false,
            )
        }
    }
}

// ── Skeleton Loading ────────────────────────────────────────────────────

@Composable
fun LBSkeleton(
    width: Dp? = null,
    height: Dp = 16.dp,
    modifier: Modifier = Modifier,
) {
    val w = width?.let { Modifier.width(it) } ?: Modifier.fillMaxWidth()
    Box(
        modifier = modifier
            .then(w)
            .height(height)
            .let { if (width != null) it else it.fillMaxWidth() },
    ) {
        // Simplified skeleton — real implementation would use shimmer animation
        Box(
            modifier = Modifier
                .matchParentSize()
                .then(
                    Modifier.padding(0.dp) // shimmer placeholder
                ),
        )
    }
}

// ── Status Badge ────────────────────────────────────────────────────────

@Composable
fun LBStatusBadge(
    status: String,
    modifier: Modifier = Modifier,
) {
    val color = when (status.lowercase()) {
        "pending" -> LightBiteTheme.colors.status.pending
        "confirmed" -> LightBiteTheme.colors.status.confirmed
        "preparing" -> LightBiteTheme.colors.status.preparing
        "ready" -> LightBiteTheme.colors.status.ready
        "assigned", "picked_up", "in_transit" -> LightBiteTheme.colors.status.assigned
        "delivered" -> LightBiteTheme.colors.status.delivered
        "cancelled", "rejected" -> LightBiteTheme.colors.status.cancelled
        else -> LightBiteTheme.colors.neutral.`400`
    }

    Text(
        text = status.replace("_", " ").replaceFirstChar { it.uppercase() },
        modifier = modifier
            .padding(
                horizontal = LightBiteTheme.spacing.sm,
                vertical = LightBiteTheme.spacing.xs,
            ),
        style = LightBiteTheme.typography.caption,
        color = color,
    )
}

// ── Screen Header ───────────────────────────────────────────────────────

@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
fun LBScreenHeader(
    title: String,
    onBack: (() -> Unit)? = null,
    actions: @Composable (() -> Unit)? = null,
) {
    TopAppBar(
        title = {
            Text(
                text = title,
                style = LightBiteTheme.typography.heading3,
                color = LightBiteTheme.colors.neutral.`900`,
            )
        },
        navigationIcon = {
            if (onBack != null) {
                IconButton(onClick = onBack) {
                    Text("←", style = LightBiteTheme.typography.heading2)
                }
            }
        },
        actions = {
            actions?.invoke()
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = LightBiteTheme.colors.neutral.`0`,
        ),
    )
}
