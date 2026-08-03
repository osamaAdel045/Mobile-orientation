import 'package:flutter/material.dart';
import 'package:lightbite_app/core/theme/extensions/lightbite_theme.dart';

/// Wraps a child widget with the required theme context for widget tests.
///
/// Use this instead of raw [MaterialApp] in tests for any widget that
/// calls [LightBiteTheme.of(context)].
Widget testApp(Widget child) {
  return MaterialApp(
    theme: ThemeData(
      extensions: const [
        LightBiteTheme(
          colors: LightBiteColors.light,
          spacing: LightBiteSpacing.standard,
          radius: LightBiteRadius.standard,
          typography: LightBiteTypography.standard,
        ),
      ],
    ),
    home: Scaffold(body: child),
  );
}
