import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import '../../domain/entities/theme_config.dart';

/// Status of the remote theme configuration loading.
enum ThemeStatus { initial, loading, loaded, error }

class ThemeState extends Equatable {
  const ThemeState({
    this.mode = ThemeMode.system,
    this.config,
    this.status = ThemeStatus.initial,
  });

  /// Light / dark / system preference.
  final ThemeMode mode;

  /// Raw theme config fetched from the backend (null = use static defaults).
  final ThemeConfig? config;

  /// Whether the remote config has been loaded.
  final ThemeStatus status;

  bool get isLoading => status == ThemeStatus.loading;

  @override
  List<Object?> get props => [mode, config, status];

  ThemeState copyWith({
    ThemeMode? mode,
    ThemeConfig? config,
    ThemeStatus? status,
    bool clearConfig = false,
  }) =>
      ThemeState(
        mode: mode ?? this.mode,
        config: clearConfig ? null : (config ?? this.config),
        status: status ?? this.status,
      );
}
