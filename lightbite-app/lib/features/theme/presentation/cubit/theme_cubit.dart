import 'package:flutter/material.dart';
import 'package:lightbite_app/core/bloc/base_cubit.dart';
import 'package:lightbite_app/features/theme/domain/usecases/get_theme_config.dart';
import 'theme_state.dart';

/// Manages both the light/dark mode preference and dynamic theme tokens
/// retrieved from the backend.
class ThemeCubit extends BaseCubit<ThemeState> {
  ThemeCubit(this._getThemeConfig) : super(const ThemeState());

  final GetThemeConfig _getThemeConfig;

  // ── Remote config ──

  /// Fetch the theme configuration from the backend and apply it.
  ///
  /// On failure the app falls back to the static defaults — the state
  /// transitions to [ThemeStatus.loaded] regardless so the UI isn't
  /// stuck in a loading state.
  Future<void> loadThemeConfig() async {
    if (state.isLoading) return;
    emit(state.copyWith(status: ThemeStatus.loading));

    final result = await _getThemeConfig();
    result.fold(
      (_) => emit(state.copyWith(status: ThemeStatus.loaded, clearConfig: true)),
      (config) => emit(
        state.copyWith(status: ThemeStatus.loaded, config: config),
      ),
    );
  }

  // ── Mode toggling ──
  void setThemeMode(ThemeMode mode) => emit(state.copyWith(mode: mode));

  void toggle() {
    switch (state.mode) {
      case ThemeMode.light:
        emit(state.copyWith(mode: ThemeMode.dark));
      case ThemeMode.dark:
        emit(state.copyWith(mode: ThemeMode.system));
      case ThemeMode.system:
        emit(state.copyWith(mode: ThemeMode.light));
    }
  }
}
