import '../../domain/entities/theme_config.dart';

/// Data source for fetching theme configuration from the backend API.
abstract class ThemeRemoteDataSource {
  /// Fetch the current theme configuration from the server.
  ///
  /// Throws on network or server errors so the repository can map them
  /// to [Failure] types.
  Future<ThemeConfig> fetchThemeConfig();
}
