import 'package:flutter/material.dart';

class AppTypography {
  AppTypography._();

  static const String fontFamily = 'Roboto';

  static const TextTheme textTheme = TextTheme(
    displayLarge: TextStyle(fontSize: 30, fontWeight: FontWeight.w700, height: 1.2),
    displayMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, height: 1.3),
    headlineLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, height: 1.4),
    headlineMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.w500, height: 1.4),
    titleLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, height: 1.5),
    bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w400, height: 1.5),
    bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, height: 1.4),
    bodySmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w400, height: 1.3),
    labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, height: 1.4),
    labelSmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, height: 1.3),
  );
}
