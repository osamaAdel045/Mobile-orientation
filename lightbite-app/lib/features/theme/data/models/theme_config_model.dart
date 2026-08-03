import 'package:equatable/equatable.dart';
import '../../../../core/utils/valid_data.dart';
import '../../domain/entities/theme_config.dart';

/// DTO for theme configuration from the backend.
///
/// Expected JSON shape:
/// ```json
/// {
///   "version": 1,
///   "colors": {
///     "primary":   { "50": "#...", ..., "900": "#..." },
///     "neutral":   { "0": "#...", ..., "900": "#..." },
///     "semantic":  { "success": "#...", "success_light": "#...", ... },
///     "status":    { "pending": "#...", "confirmed": "#...", ... }
///   },
///   "typography": {
///     "font_family": "System",
///     "scale": { "xs": 12, "sm": 14, "base": 16, "lg": 18, "xl": 20, "2xl": 24, "3xl": 30 }
///   },
///   "spacing":       { "xs": 4, "sm": 8, "md": 16, "lg": 24, "xl": 32, "2xl": 48 },
///   "border_radius": { "sm": 6, "md": 12, "lg": 16, "full": 9999 },
///   "shadows":       { ... },
///   "meta":          { "version": 1, "trace_id": "" }
/// }
/// ```
class ThemeConfigModel extends Equatable {
  const ThemeConfigModel({
    required this.colors,
    required this.fontFamily,
    required this.typography,
    required this.spacing,
    required this.borderRadius,
  });

  /// Flattened hex color tokens (camelCase keys).
  final Map<String, String> colors;

  /// Font family name.
  final String fontFamily;

  /// Typography scale keys → font sizes.
  final Map<String, double> typography;

  /// Named spacing tokens.
  final Map<String, double> spacing;

  /// Named border-radius tokens.
  final Map<String, double> borderRadius;

  factory ThemeConfigModel.fromJson(Map<String, dynamic> json) {
    // ── Colors: flatten nested structure ──
    final colorsRaw = validateMap<String, dynamic>(json['colors']);
    final Map<String, String> colors = {};

    // primary.500 → primary500, primary.100 → primary100, etc.
    final primary = validateMap<String, dynamic>(colorsRaw['primary']);
    for (final entry in primary.entries) {
      colors['primary${entry.key}'] = entry.value.toString();
    }

    // neutral.0 → neutral0, neutral.50 → neutral50, etc.
    final neutral = validateMap<String, dynamic>(colorsRaw['neutral']);
    for (final entry in neutral.entries) {
      colors['neutral${entry.key}'] = entry.value.toString();
    }

    // semantic.success → success, semantic.success_light → successLight, etc.
    final semantic = validateMap<String, dynamic>(colorsRaw['semantic']);
    for (final entry in semantic.entries) {
      colors[_snakeToCamel(entry.key)] = entry.value.toString();
    }

    // status.pending → statusPending, status.confirmed → statusConfirmed, etc.
    final status = validateMap<String, dynamic>(colorsRaw['status']);
    for (final entry in status.entries) {
      colors['status${_capitalize(entry.key)}'] = entry.value.toString();
    }

    // ── Typography ──
    final typographyRaw = validateMap<String, dynamic>(json['typography']);
    final scale = validateMap<String, dynamic>(typographyRaw['scale']);
    final Map<String, double> typography = {
      for (final entry in scale.entries)
        entry.key: (entry.value as num).toDouble(),
    };

    // ── Spacing & border radius ──
    final spacingRaw = validateMap<String, dynamic>(json['spacing']);
    final Map<String, double> spacing = {
      for (final entry in spacingRaw.entries)
        entry.key: (entry.value as num).toDouble(),
    };

    final borderRadiusRaw = validateMap<String, dynamic>(json['border_radius']);
    final Map<String, double> borderRadius = {
      for (final entry in borderRadiusRaw.entries)
        entry.key: (entry.value as num).toDouble(),
    };

    return ThemeConfigModel(
      colors: colors,
      fontFamily: validateString(typographyRaw['font_family'], 'System'),
      typography: typography,
      spacing: spacing,
      borderRadius: borderRadius,
    );
  }

  Map<String, dynamic> toJson() => {
        'colors': colors,
        'font_family': fontFamily,
        'typography': typography,
        'spacing': spacing,
        'border_radius': borderRadius,
      };

  @override
  List<Object?> get props => [colors, fontFamily, typography, spacing, borderRadius];

  ThemeConfig toEntity() => ThemeConfig(
        colors: Map<String, String>.from(colors),
        fontFamily: fontFamily,
        typography: Map<String, double>.from(typography),
        spacing: Map<String, double>.from(spacing),
        borderRadius: Map<String, double>.from(borderRadius),
      );

  // ── Helpers ───────────────────────────────────────────────────

  /// Converts `snake_case` to `camelCase`.
  static String _snakeToCamel(String key) {
    final parts = key.split('_');
    if (parts.length == 1) return key;
    return parts.first + parts.skip(1).map(_capitalize).join();
  }

  /// Capitalizes the first letter of [s].
  static String _capitalize(String s) {
    if (s.isEmpty) return s;
    return s[0].toUpperCase() + s.substring(1);
  }
}
