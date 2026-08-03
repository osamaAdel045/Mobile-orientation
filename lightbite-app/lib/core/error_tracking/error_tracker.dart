import 'dart:async';
import 'package:flutter/foundation.dart';
import '../config/app_environment.dart';
import '../logger/app_logger.dart';

/// Abstraction for crash/error reporting services (Sentry, Firebase, etc.).
///
/// In production, wire a real implementation (e.g., SentryErrorTracker).
/// In dev/staging, use [NoOpErrorTracker] or a console logger.
abstract class ErrorTracker {
  /// Report a handled exception.
  void captureException(Object error, StackTrace? stack, {String? hint});

  /// Report a handled but unexpected state (breadcrumb).
  void captureMessage(String message, {Map<String, dynamic>? data});

  /// Set user context so crashes are tagged with the current user.
  void setUser(String uuid, {String? email, String? name});

  /// Clear user context (e.g., on logout).
  void clearUser();
}

/// Console-based tracker for development.
class ConsoleErrorTracker implements ErrorTracker {
  ConsoleErrorTracker(this._logger);

  final AppLogger _logger;

  @override
  void captureException(Object error, StackTrace? stack, {String? hint}) {
    _logger.error(hint ?? 'Unhandled exception', error, stack);
  }

  @override
  void captureMessage(String message, {Map<String, dynamic>? data}) {
    _logger.info(message, data);
  }

  @override
  void setUser(String uuid, {String? email, String? name}) {
    _logger.info('User context set', {'uuid': uuid, 'email': email});
  }

  @override
  void clearUser() {
    _logger.info('User context cleared');
  }
}

/// No-op tracker for environments without crash reporting.
class NoOpErrorTracker implements ErrorTracker {
  const NoOpErrorTracker();

  @override
  void captureException(Object error, StackTrace? stack, {String? hint}) {}

  @override
  void captureMessage(String message, {Map<String, dynamic>? data}) {}

  @override
  void setUser(String uuid, {String? email, String? name}) {}

  @override
  void clearUser() {}
}

/// Initializes global Flutter error handling and routes to [tracker].
void setupFlutterErrorHandling(ErrorTracker tracker) {
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    tracker.captureException(
      details.exception,
      details.stack,
      hint: 'Flutter error: ${details.summary}',
    );
  };

  PlatformDispatcher.instance.onError = (error, stack) {
    tracker.captureException(error, stack, hint: 'Platform error');
    return true;
  };

  // Catch errors in async zones
  runZonedGuarded(() {
    // App runs inside this zone
  }, (error, stack) {
    tracker.captureException(error, stack, hint: 'Unhandled async error');
  });
}

/// Selects the right error tracker based on the environment.
ErrorTracker createErrorTracker(AppEnvironmentConfig config, AppLogger logger) {
  if (config.enableCrashReporting) {
    // TODO: Return SentryErrorTracker(sentryDsn) or FirebaseCrashlyticsTracker()
    // when the package is added and DSN is configured.
    return ConsoleErrorTracker(logger);
  }
  return ConsoleErrorTracker(logger);
}
