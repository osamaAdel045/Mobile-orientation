import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import '../entities/theme_config.dart';

/// Repository for fetching theme configuration from the backend.
abstract class ThemeRepository {
  /// Retrieve the remote theme configuration.
  ///
  /// Returns [ThemeConfig] on success or a [Failure] when the request fails
  /// (network error, server error, etc.).
  Future<Either<Failure, ThemeConfig>> getThemeConfig();
}
