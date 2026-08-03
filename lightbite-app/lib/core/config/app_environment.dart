/// Environment-flavored configuration.
///
/// Select the active environment at startup using `--dart-define=ENV=staging`
/// or the `AppEnvironment.current` getter which reads from a compile-time
/// constant. Falls back to `development` when no define is set.
enum AppEnvironment { development, staging, production }

class AppEnvironmentConfig {
  final AppEnvironment environment;
  final String apiBaseUrl;
  final String wsUrl;
  final bool enableApiLogging;
  final bool enableCrashReporting;

  const AppEnvironmentConfig({
    required this.environment,
    required this.apiBaseUrl,
    required this.wsUrl,
    this.enableApiLogging = false,
    this.enableCrashReporting = false,
  });

  /// The active configuration, resolved at startup from `--dart-define=ENV=...`.
  static final AppEnvironmentConfig current = () {
    const env = String.fromEnvironment('ENV', defaultValue: 'development');
    switch (env) {
      case 'production':
        return production;
      case 'staging':
        return staging;
      case 'development':
      default:
        return development;
    }
  }();

  // ── Pre-built configs ──

  static const AppEnvironmentConfig development = AppEnvironmentConfig(
    environment: AppEnvironment.development,
    apiBaseUrl: 'http://localhost:8001/api/v1',
    wsUrl: 'ws://localhost:8080/app',
    enableApiLogging: true,
  );

  static const AppEnvironmentConfig staging = AppEnvironmentConfig(
    environment: AppEnvironment.staging,
    apiBaseUrl: 'https://staging-api.lightbite.com/api/v1',
    wsUrl: 'wss://staging-ws.lightbite.com/app',
    enableApiLogging: true,
    enableCrashReporting: true,
  );

  static const AppEnvironmentConfig production = AppEnvironmentConfig(
    environment: AppEnvironment.production,
    apiBaseUrl: 'https://api.lightbite.com/api/v1',
    wsUrl: 'wss://ws.lightbite.com/app',
    enableCrashReporting: true,
  );

  // ── App-wide defaults ──

  /// Default coordinates for location-based features (Dubai city center).
  static const double defaultLat = 25.0801;
  static const double defaultLng = 55.1400;

  /// Default search radius in kilometers for nearby restaurants.
  static const int nearbyRadiusKm = 10;

  /// Default network request timeout.
  static const Duration requestTimeout = Duration(seconds: 30);

  /// Maximum retry attempts for failed requests.
  static const int maxRetries = 3;

  /// Token refresh is attempted when expiry is within this window.
  static const Duration refreshThreshold = Duration(minutes: 10);
}
