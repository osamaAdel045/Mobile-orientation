package com.lightbite.app.core.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ── Color Tokens (from system-desing/11-design-system.md) ──────────────

/**
 * Primary palette — Orange (#F97316).
 * NEVER use Color(0x…) directly in composables.
 * Detekt rule NoRawDesignValues blocks it.
 */
@Immutable
data class PrimaryColors(
    val `50`: Color  = Color(0xFFFFF7ED),
    val `100`: Color = Color(0xFFFFEDD5),
    val `200`: Color = Color(0xFFFED7AA),
    val `300`: Color = Color(0xFFFDBA74),
    val `400`: Color = Color(0xFFFB923C),
    val `500`: Color = Color(0xFFF97316), // Base
    val `600`: Color = Color(0xFFEA580C),
    val `700`: Color = Color(0xFFC2410C),
    val `800`: Color = Color(0xFF9A3412),
    val `900`: Color = Color(0xFF7C2D12),
)

/**
 * Neutral palette.
 */
@Immutable
data class NeutralColors(
    val `0`: Color   = Color(0xFFFFFFFF),
    val `50`: Color  = Color(0xFFF9FAFB),
    val `100`: Color = Color(0xFFF3F4F6),
    val `200`: Color = Color(0xFFE5E7EB),
    val `300`: Color = Color(0xFFD1D5DB),
    val `400`: Color = Color(0xFF9CA3AF),
    val `500`: Color = Color(0xFF6B7280),
    val `600`: Color = Color(0xFF4B5563),
    val `700`: Color = Color(0xFF374151),
    val `800`: Color = Color(0xFF1F2937),
    val `900`: Color = Color(0xFF111827),
)

/**
 * Semantic colors.
 */
@Immutable
data class SemanticColors(
    val success: Color = Color(0xFF16A34A),
    val warning: Color = Color(0xFFF59E0B),
    val error: Color   = Color(0xFFDC2626),
    val info: Color    = Color(0xFF2563EB),
)

/**
 * Order-status mapped colors (from design system).
 */
@Immutable
data class StatusColors(
    val pending: Color    = Color(0xFFF59E0B), // amber
    val confirmed: Color  = Color(0xFF2563EB), // blue
    val preparing: Color  = Color(0xFFF59E0B), // amber
    val ready: Color      = Color(0xFF16A34A), // green
    val assigned: Color   = Color(0xFFF97316), // orange
    val pickedUp: Color   = Color(0xFFF97316), // orange
    val inTransit: Color  = Color(0xFF2563EB), // blue
    val delivered: Color  = Color(0xFF16A34A), // green
    val cancelled: Color  = Color(0xFFDC2626), // red
    val rejected: Color   = Color(0xFFDC2626), // red
)

// ── Typography Tokens ───────────────────────────────────────────────────

@Immutable
data class LightBiteTypography(
    val displayLarge: TextStyle = TextStyle(
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 36.sp,
    ),
    val heading1: TextStyle = TextStyle(
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        lineHeight = 32.sp,
    ),
    val heading2: TextStyle = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 20.sp,
        lineHeight = 28.sp,
    ),
    val heading3: TextStyle = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 18.sp,
        lineHeight = 24.sp,
    ),
    val body: TextStyle = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
    ),
    val bodySmall: TextStyle = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
    ),
    val caption: TextStyle = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp,
    ),
    val button: TextStyle = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 24.sp,
    ),
)

// ── Spacing Tokens ──────────────────────────────────────────────────────

@Immutable
data class LightBiteSpacing(
    val xs: Dp = 4.dp,
    val sm: Dp = 8.dp,
    val md: Dp = 16.dp,
    val lg: Dp = 24.dp,
    val xl: Dp = 32.dp,
    val xxl: Dp = 48.dp,
)

// ── Radius Tokens ───────────────────────────────────────────────────────

@Immutable
data class LightBiteRadius(
    val sm: Dp = 4.dp,
    val md: Dp = 8.dp,
    val lg: Dp = 12.dp,
    val xl: Dp = 16.dp,
    val full: Dp = 9999.dp,
)

// ── Shadow Tokens ───────────────────────────────────────────────────────

@Immutable
data class LightBiteShadows(
    val sm: Dp = 2.dp,
    val md: Dp = 4.dp,
    val lg: Dp = 8.dp,
    val xl: Dp = 16.dp,
)

// ── Combined Theme ──────────────────────────────────────────────────────

@Immutable
data class LightBiteColors(
    val primary: PrimaryColors = PrimaryColors(),
    val neutral: NeutralColors = NeutralColors(),
    val semantic: SemanticColors = SemanticColors(),
    val status: StatusColors = StatusColors(),
)

object LightBiteThemeTokens {
    val colors = LightBiteColors()
    val typography = LightBiteTypography()
    val spacing = LightBiteSpacing()
    val radius = LightBiteRadius()
    val shadows = LightBiteShadows()
}

// ── CompositionLocal ────────────────────────────────────────────────────

val LocalLightBiteColors = staticCompositionLocalOf { LightBiteColors() }
val LocalLightBiteTypography = staticCompositionLocalOf { LightBiteTypography() }
val LocalLightBiteSpacing = staticCompositionLocalOf { LightBiteSpacing() }
val LocalLightBiteRadius = staticCompositionLocalOf { LightBiteRadius() }
val LocalLightBiteShadows = staticCompositionLocalOf { LightBiteShadows() }

// ── Material3 ColorSchemes ──────────────────────────────────────────────

private val LightColorScheme = lightColorScheme(
    primary = LightBiteThemeTokens.colors.primary.`500`,
    onPrimary = Color.White,
    primaryContainer = LightBiteThemeTokens.colors.primary.`100`,
    secondary = LightBiteThemeTokens.colors.neutral.`600`,
    background = LightBiteThemeTokens.colors.neutral.`0`,
    surface = LightBiteThemeTokens.colors.neutral.`0`,
    error = LightBiteThemeTokens.colors.semantic.error,
    onBackground = LightBiteThemeTokens.colors.neutral.`900`,
    onSurface = LightBiteThemeTokens.colors.neutral.`900`,
    outline = LightBiteThemeTokens.colors.neutral.`200`,
)

private val DarkColorScheme = darkColorScheme(
    primary = LightBiteThemeTokens.colors.primary.`400`,
    onPrimary = LightBiteThemeTokens.colors.neutral.`900`,
    primaryContainer = LightBiteThemeTokens.colors.primary.`800`,
    secondary = LightBiteThemeTokens.colors.neutral.`400`,
    background = LightBiteThemeTokens.colors.neutral.`900`,
    surface = LightBiteThemeTokens.colors.neutral.`800`,
    error = LightBiteThemeTokens.colors.semantic.error,
    onBackground = LightBiteThemeTokens.colors.neutral.`0`,
    onSurface = LightBiteThemeTokens.colors.neutral.`0`,
    outline = LightBiteThemeTokens.colors.neutral.`700`,
)

// ── Theme Composable ────────────────────────────────────────────────────

@Composable
fun LightBiteTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    CompositionLocalProvider(
        LocalLightBiteColors provides LightBiteThemeTokens.colors,
        LocalLightBiteTypography provides LightBiteThemeTokens.typography,
        LocalLightBiteSpacing provides LightBiteThemeTokens.spacing,
        LocalLightBiteRadius provides LightBiteThemeTokens.radius,
        LocalLightBiteShadows provides LightBiteThemeTokens.shadows,
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            content = content,
        )
    }
}

/** Convenience accessor for the LightBite theme within a composable. */
object LightBiteTheme {
    val colors: LightBiteColors
        @Composable get() = LocalLightBiteColors.current

    val typography: LightBiteTypography
        @Composable get() = LocalLightBiteTypography.current

    val spacing: LightBiteSpacing
        @Composable get() = LocalLightBiteSpacing.current

    val radius: LightBiteRadius
        @Composable get() = LocalLightBiteRadius.current

    val shadows: LightBiteShadows
        @Composable get() = LocalLightBiteShadows.current
}
