import 'package:flutter/material.dart';

/// Design tokens carried via [ThemeExtension] so every widget can access
/// colors, spacing, radius, and typography from a single `of(context)` call.
///
/// Usage:
/// ```dart
/// final theme = LightBiteTheme.of(context);
/// Container(color: theme.colors.primary500, borderRadius: theme.radius.md);
/// ```
class LightBiteTheme extends ThemeExtension<LightBiteTheme> {
  const LightBiteTheme({
    required this.colors,
    required this.spacing,
    required this.radius,
    required this.typography,
  });

  final LightBiteColors colors;
  final LightBiteSpacing spacing;
  final LightBiteRadius radius;
  final LightBiteTypography typography;

  /// Convenience accessor.
  static LightBiteTheme of(BuildContext context) =>
      Theme.of(context).extension<LightBiteTheme>()!;

  @override
  ThemeExtension<LightBiteTheme> copyWith({
    LightBiteColors? colors,
    LightBiteSpacing? spacing,
    LightBiteRadius? radius,
    LightBiteTypography? typography,
  }) =>
      LightBiteTheme(
        colors: colors ?? this.colors,
        spacing: spacing ?? this.spacing,
        radius: radius ?? this.radius,
        typography: typography ?? this.typography,
      );

  @override
  ThemeExtension<LightBiteTheme> lerp(LightBiteTheme? other, double t) =>
      LightBiteTheme(
        colors: LightBiteColors.lerp(colors, other?.colors ?? colors, t),
        spacing: LightBiteSpacing.lerp(spacing, other?.spacing ?? spacing, t),
        radius: LightBiteRadius.lerp(radius, other?.radius ?? radius, t),
        typography: LightBiteTypography.lerp(typography, other?.typography ?? typography, t),
      );
}

// ─── Colors ────────────────────────────────────────────────────

class LightBiteColors {
  const LightBiteColors({
    required this.primary500,
    required this.primary600,
    required this.primary100,
    required this.neutral0,
    required this.neutral100,
    required this.neutral200,
    required this.neutral400,
    required this.neutral700,
    required this.neutral900,
    required this.success,
    required this.successLight,
    required this.warning,
    required this.warningLight,
    required this.error,
    required this.errorLight,
    required this.info,
    required this.infoLight,
    required this.scaffoldBackground,
    required this.cardBackground,
    required this.surfaceBorder,
    required this.statusPending,
    required this.statusConfirmed,
    required this.statusPreparing,
    required this.statusReady,
    required this.statusDelivering,
    required this.statusDelivered,
    required this.statusCancelled,
    required this.statusRejected,
  });

  final Color primary500;
  final Color primary600;
  final Color primary100;
  final Color neutral0;
  final Color neutral100;
  final Color neutral200;
  final Color neutral400;
  final Color neutral700;
  final Color neutral900;
  final Color success;
  final Color successLight;
  final Color warning;
  final Color warningLight;
  final Color error;
  final Color errorLight;
  final Color info;
  final Color infoLight;
  final Color scaffoldBackground;
  final Color cardBackground;
  final Color surfaceBorder;

  // Status colors
  final Color statusPending;
  final Color statusConfirmed;
  final Color statusPreparing;
  final Color statusReady;
  final Color statusDelivering;
  final Color statusDelivered;
  final Color statusCancelled;
  final Color statusRejected;

  /// Pre-built light palette.
  static const light = LightBiteColors(
    primary500: Color(0xFFF97316),
    primary600: Color(0xFFEA580C),
    primary100: Color(0xFFFFEDD5),
    neutral0: Color(0xFFFFFFFF),
    neutral100: Color(0xFFF3F4F6),
    neutral200: Color(0xFFE5E7EB),
    neutral400: Color(0xFF9CA3AF),
    neutral700: Color(0xFF374151),
    neutral900: Color(0xFF111827),
    success: Color(0xFF16A34A),
    successLight: Color(0xFFDCFCE7),
    warning: Color(0xFFF59E0B),
    warningLight: Color(0xFFFEF3C7),
    error: Color(0xFFDC2626),
    errorLight: Color(0xFFFEE2E2),
    info: Color(0xFF2563EB),
    infoLight: Color(0xFFDBEAFE),
    scaffoldBackground: Color(0xFFF9FAFB),
    cardBackground: Color(0xFFFFFFFF),
    surfaceBorder: Color(0xFFE5E7EB),
    statusPending: Color(0xFFF59E0B),
    statusConfirmed: Color(0xFF2563EB),
    statusPreparing: Color(0xFFF59E0B),
    statusReady: Color(0xFF16A34A),
    statusDelivering: Color(0xFFF97316),
    statusDelivered: Color(0xFF16A34A),
    statusCancelled: Color(0xFFDC2626),
    statusRejected: Color(0xFFDC2626),
  );

  /// Pre-built dark palette.
  static const dark = LightBiteColors(
    primary500: Color(0xFFFB923C),
    primary600: Color(0xFFF97316),
    primary100: Color(0xFF431407),
    neutral0: Color(0xFF1F2937),
    neutral100: Color(0xFF374151),
    neutral200: Color(0xFF4B5563),
    neutral400: Color(0xFF9CA3AF),
    neutral700: Color(0xFFD1D5DB),
    neutral900: Color(0xFFF9FAFB),
    success: Color(0xFF22C55E),
    successLight: Color(0xFF052E16),
    warning: Color(0xFFFBBF24),
    warningLight: Color(0xFF451A03),
    error: Color(0xFFEF4444),
    errorLight: Color(0xFF450A0A),
    info: Color(0xFF3B82F6),
    infoLight: Color(0xFF172554),
    scaffoldBackground: Color(0xFF111827),
    cardBackground: Color(0xFF1F2937),
    surfaceBorder: Color(0xFF374151),
    statusPending: Color(0xFFFBBF24),
    statusConfirmed: Color(0xFF60A5FA),
    statusPreparing: Color(0xFFFBBF24),
    statusReady: Color(0xFF4ADE80),
    statusDelivering: Color(0xFFFB923C),
    statusDelivered: Color(0xFF4ADE80),
    statusCancelled: Color(0xFFF87171),
    statusRejected: Color(0xFFF87171),
  );

  static LightBiteColors lerp(LightBiteColors a, LightBiteColors b, double t) => t < 0.5 ? a : b;
}

// ─── Spacing ────────────────────────────────────────────────────

class LightBiteSpacing {
  const LightBiteSpacing({
    required this.xs,
    required this.sm,
    required this.md,
    required this.lg,
    required this.xl,
    required this.xxl,
  });

  final double xs;
  final double sm;
  final double md;
  final double lg;
  final double xl;
  final double xxl;

  static const standard = LightBiteSpacing(xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48);

  static LightBiteSpacing lerp(LightBiteSpacing a, LightBiteSpacing b, double t) => t < 0.5 ? a : b;
}

// ─── Border Radius ──────────────────────────────────────────────

class LightBiteRadius {
  const LightBiteRadius({required this.sm, required this.md, required this.lg, required this.full});

  final BorderRadius sm;
  final BorderRadius md;
  final BorderRadius lg;
  final BorderRadius full;

  static const standard = LightBiteRadius(
    sm: BorderRadius.all(Radius.circular(8)),
    md: BorderRadius.all(Radius.circular(12)),
    lg: BorderRadius.all(Radius.circular(16)),
    full: BorderRadius.all(Radius.circular(999)),
  );

  static LightBiteRadius lerp(LightBiteRadius a, LightBiteRadius b, double t) => t < 0.5 ? a : b;
}

// ─── Typography references ─────────────────────────────────────

class LightBiteTypography {
  const LightBiteTypography({
    required this.fontFamily,
    required this.displayLarge,
    required this.headlineMedium,
    required this.titleLarge,
    required this.titleMedium,
    required this.bodyLarge,
    required this.bodyMedium,
    required this.labelLarge,
    required this.labelMedium,
  });

  final String fontFamily;
  final TextStyle displayLarge;
  final TextStyle headlineMedium;
  final TextStyle titleLarge;
  final TextStyle titleMedium;
  final TextStyle bodyLarge;
  final TextStyle bodyMedium;
  final TextStyle labelLarge;
  final TextStyle labelMedium;

  static const standard = LightBiteTypography(
    fontFamily: 'Roboto',
    displayLarge: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, height: 1.3),
    headlineMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.w600, height: 1.3),
    titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, height: 1.4),
    titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, height: 1.4),
    bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w400, height: 1.5),
    bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, height: 1.5),
    labelLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, height: 1.3),
    labelMedium: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, height: 1.3),
  );

  static LightBiteTypography lerp(LightBiteTypography a, LightBiteTypography b, double t) => t < 0.5 ? a : b;
}
