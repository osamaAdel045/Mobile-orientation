import 'package:flutter/material.dart';
import 'package:lightbite_app/core/theme/extensions/lightbite_theme.dart';
import 'package:lightbite_app/features/theme/domain/entities/theme_config.dart';

class AppTheme {
  AppTheme._();

  // ── Light ─────────────────────────────────────────────────

  /// Build a light [ThemeData] using optional remote [ThemeConfig] overrides.
  ///
  /// When [config] is null the static default [LightBiteColors.light] palette
  /// is used. When provided the backend values are merged with safe defaults
  /// for any missing tokens.
  static ThemeData light([ThemeConfig? config]) {
    final colors = config != null ? _colorsFromConfig(config, isDark: false) : LightBiteColors.light;
    const spacing = LightBiteSpacing.standard;
    const radius = LightBiteRadius.standard;
    final typography = config != null ? _typographyFromConfig(config) : LightBiteTypography.standard;

    return ThemeData(
      useMaterial3: true,
      colorSchemeSeed: colors.primary500,
      brightness: Brightness.light,
      fontFamily: typography.fontFamily,
      scaffoldBackgroundColor: colors.scaffoldBackground,
      textTheme: _buildTextTheme(colors, typography),
      extensions: [LightBiteTheme(colors: colors, spacing: spacing, radius: radius, typography: typography)],

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colors.neutral0,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: colors.neutral200)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: colors.neutral200)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: colors.primary500, width: 2)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: colors.error)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: colors.primary500,
          foregroundColor: colors.neutral0,
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: typography.labelLarge,
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: colors.neutral900,
          side: BorderSide(color: colors.neutral200),
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),

      cardTheme: CardThemeData(
        elevation: 0,
        color: colors.cardBackground,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: colors.surfaceBorder)),
        margin: EdgeInsets.zero,
      ),

      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: colors.neutral0,
        selectedItemColor: colors.primary500,
        unselectedItemColor: colors.neutral400,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),

      appBarTheme: AppBarTheme(backgroundColor: colors.neutral0, foregroundColor: colors.neutral900, elevation: 0, centerTitle: true),

      chipTheme: ChipThemeData(
        backgroundColor: colors.neutral100,
        selectedColor: colors.primary100,
        labelStyle: TextStyle(color: colors.neutral700),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        side: BorderSide.none,
      ),
    );
  }

  // ── Dark ──────────────────────────────────────────────────

  /// Build a dark [ThemeData] using optional remote [ThemeConfig] overrides.
  ///
  /// When [config] is null the static default [LightBiteColors.dark] palette
  /// is used.
  static ThemeData dark([ThemeConfig? config]) {
    final colors = config != null ? _colorsFromConfig(config, isDark: true) : LightBiteColors.dark;
    const spacing = LightBiteSpacing.standard;
    const radius = LightBiteRadius.standard;
    final typography = config != null ? _typographyFromConfig(config) : LightBiteTypography.standard;
    print('AppTheme.dark ${colors.primary500}');

    return ThemeData(
      useMaterial3: true,
      colorSchemeSeed: colors.primary500,
      brightness: Brightness.dark,
      fontFamily: typography.fontFamily,
      scaffoldBackgroundColor: colors.scaffoldBackground,
      textTheme: _buildTextTheme(colors, typography),
      extensions: [LightBiteTheme(colors: colors, spacing: spacing, radius: radius, typography: typography)],

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colors.neutral100,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: colors.neutral200)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: colors.neutral200)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: colors.primary500, width: 2)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: colors.error)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: colors.primary500,
          foregroundColor: colors.neutral900,
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: typography.labelLarge,
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: colors.neutral700,
          side: BorderSide(color: colors.neutral200),
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),

      cardTheme: CardThemeData(
        elevation: 0,
        color: colors.cardBackground,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: colors.surfaceBorder)),
        margin: EdgeInsets.zero,
      ),

      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: colors.neutral0,
        selectedItemColor: colors.primary500,
        unselectedItemColor: colors.neutral400,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),

      appBarTheme: AppBarTheme(backgroundColor: colors.neutral0, foregroundColor: colors.neutral900, elevation: 0, centerTitle: true),

      chipTheme: ChipThemeData(
        backgroundColor: colors.neutral100,
        selectedColor: colors.primary100,
        labelStyle: TextStyle(color: colors.neutral700),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        side: BorderSide.none,
      ),
    );
  }

  // ── Remote config → token objects ─────────────────────────

  /// Build [LightBiteColors] from a remote config, falling back to the
  /// static light or dark palette for any missing values.
  static LightBiteColors _colorsFromConfig(ThemeConfig config, {required bool isDark}) {
    final defaults = isDark ? LightBiteColors.dark : LightBiteColors.light;
    final c = config.colors;
    return LightBiteColors(
      primary500: _hex(c['primary500']) ?? defaults.primary500,
      primary600: _hex(c['primary600']) ?? defaults.primary600,
      primary100: _hex(c['primary100']) ?? defaults.primary100,
      neutral0: _hex(c['neutral0']) ?? defaults.neutral0,
      neutral100: _hex(c['neutral100']) ?? defaults.neutral100,
      neutral200: _hex(c['neutral200']) ?? defaults.neutral200,
      neutral400: _hex(c['neutral400']) ?? defaults.neutral400,
      neutral700: _hex(c['neutral700']) ?? defaults.neutral700,
      neutral900: _hex(c['neutral900']) ?? defaults.neutral900,
      success: _hex(c['success']) ?? defaults.success,
      successLight: _hex(c['successLight']) ?? defaults.successLight,
      warning: _hex(c['warning']) ?? defaults.warning,
      warningLight: _hex(c['warningLight']) ?? defaults.warningLight,
      error: _hex(c['error']) ?? defaults.error,
      errorLight: _hex(c['errorLight']) ?? defaults.errorLight,
      info: _hex(c['info']) ?? defaults.info,
      infoLight: _hex(c['infoLight']) ?? defaults.infoLight,
      scaffoldBackground: _hex(c['scaffoldBackground']) ?? defaults.scaffoldBackground,
      cardBackground: _hex(c['cardBackground']) ?? defaults.cardBackground,
      surfaceBorder: _hex(c['surfaceBorder']) ?? defaults.surfaceBorder,
      statusPending: _hex(c['statusPending']) ?? defaults.statusPending,
      statusConfirmed: _hex(c['statusConfirmed']) ?? defaults.statusConfirmed,
      statusPreparing: _hex(c['statusPreparing']) ?? defaults.statusPreparing,
      statusReady: _hex(c['statusReady']) ?? defaults.statusReady,
      statusDelivering: _hex(c['statusDelivering']) ?? defaults.statusDelivering,
      statusDelivered: _hex(c['statusDelivered']) ?? defaults.statusDelivered,
      statusCancelled: _hex(c['statusCancelled']) ?? defaults.statusCancelled,
      statusRejected: _hex(c['statusRejected']) ?? defaults.statusRejected,
    );
  }

  /// Build [LightBiteTypography] from a remote config's scale map.
  ///
  /// Maps the API typography scale keys to semantic text-style roles
  /// using sensible weight and height defaults.
  static LightBiteTypography _typographyFromConfig(ThemeConfig config) {
    const defaults = LightBiteTypography.standard;
    final scale = config.typography;

    // Scale key → (weight, height)
    final mapping = <String, (FontWeight, double)>{
      'xs': (FontWeight.w500, 1.3),   // labelMedium
      'sm': (FontWeight.w400, 1.5),   // bodyMedium
      'base': (FontWeight.w400, 1.5), // bodyLarge / body fallback
      'lg': (FontWeight.w600, 1.4),   // titleLarge
      '2xl': (FontWeight.w600, 1.3),  // headlineMedium
      '3xl': (FontWeight.w700, 1.3),  // displayLarge
    };

    TextStyle _style(String scaleKey, TextStyle fallback) {
      final size = scale[scaleKey];
      if (size == null) return fallback;
      final m = mapping[scaleKey];
      return TextStyle(fontSize: size, fontWeight: m?.$1, height: m?.$2);
    }

    return LightBiteTypography(
      fontFamily: config.fontFamily,
      displayLarge: _style('3xl', defaults.displayLarge),
      headlineMedium: _style('2xl', defaults.headlineMedium),
      titleLarge: _style('lg', defaults.titleLarge),
      titleMedium: TextStyle(
        fontSize: scale['base'] ?? defaults.titleMedium.fontSize!,
        fontWeight: FontWeight.w600,
        height: 1.4,
      ),
      bodyLarge: _style('base', defaults.bodyLarge),
      bodyMedium: _style('sm', defaults.bodyMedium),
      labelLarge: TextStyle(
        fontSize: scale['base'] ?? defaults.labelLarge.fontSize!,
        fontWeight: FontWeight.w600,
        height: 1.3,
      ),
      labelMedium: _style('xs', defaults.labelMedium),
    );
  }

  // ── Helpers ───────────────────────────────────────────────

  static TextTheme _buildTextTheme(LightBiteColors colors, LightBiteTypography typography) => TextTheme(
        displayLarge: typography.displayLarge.copyWith(color: colors.neutral900),
        headlineMedium: typography.headlineMedium.copyWith(color: colors.neutral900),
        titleLarge: typography.titleLarge.copyWith(color: colors.neutral900),
        titleMedium: typography.titleMedium.copyWith(color: colors.neutral900),
        bodyLarge: typography.bodyLarge.copyWith(color: colors.neutral700),
        bodyMedium: typography.bodyMedium.copyWith(color: colors.neutral700),
        labelLarge: typography.labelLarge.copyWith(color: colors.neutral900),
        labelMedium: typography.labelMedium.copyWith(color: colors.neutral400),
      );

  /// Parse a hex color string (e.g. `"#F97316"`) to a [Color], or return null.
  static Color? _hex(String? hex) {
    if (hex == null || hex.length < 6) return null;
    final cleaned = hex.replaceFirst('#', '');
    if (cleaned.length == 6) return Color(int.parse('FF$cleaned', radix: 16));
    return Color(int.parse(cleaned, radix: 16));
  }
}
