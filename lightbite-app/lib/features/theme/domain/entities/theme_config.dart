import 'package:equatable/equatable.dart';

/// Holds theme configuration retrieved from the backend.
///
/// All values are pure Dart with no Flutter dependency so the domain
/// layer stays framework-agnostic.
///
/// Colors are flattened from the nested API structure:
///   `colors.primary.500`  →  `colors['primary500']`
///   `colors.semantic.success_light`  →  `colors['successLight']`
///   `colors.status.pending`  →  `colors['statusPending']`
class ThemeConfig extends Equatable {
  const ThemeConfig({
    required this.colors,
    required this.fontFamily,
    required this.typography,
    required this.spacing,
    required this.borderRadius,
  });

  /// Flattened hex color tokens (e.g. `"#F97316"`).
  ///
  /// Keys follow camelCase: `primary500`, `neutral0`, `successLight`,
  /// `statusPending`, etc.
  final Map<String, String> colors;

  /// Font family name (e.g. `"System"`, `"Roboto"`).
  final String fontFamily;

  /// Typography scale keys mapped to font sizes in logical pixels.
  /// Keys are `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`.
  final Map<String, double> typography;

  /// Named spacing tokens (e.g. `{"xs": 4, "sm": 8, ...}`).
  final Map<String, double> spacing;

  /// Named border-radius tokens (e.g. `{"sm": 6, "md": 12, ...}`).
  final Map<String, double> borderRadius;

  @override
  List<Object?> get props => [colors, fontFamily, typography, spacing, borderRadius];
}
