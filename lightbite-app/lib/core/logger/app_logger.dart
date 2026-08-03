import 'dart:developer' as developer;

/// Structured logging abstraction.
///
/// Replace the dev implementation with Sentry / Firebase Crashlytics / etc.
/// in production by providing a different [AppLogger] implementation via DI.
abstract class AppLogger {
  void debug(String message, [Map<String, dynamic>? data]);
  void info(String message, [Map<String, dynamic>? data]);
  void warn(String message, [Map<String, dynamic>? data]);
  void error(String message, [Object? error, StackTrace? stack]);
}

class PrintLogger implements AppLogger {
  const PrintLogger({this.minLevel = LogLevel.debug});

  final LogLevel minLevel;

  @override
  void debug(String message, [Map<String, dynamic>? data]) {
    if (minLevel.index <= LogLevel.debug.index) _log('🐛', message, data);
  }

  @override
  void info(String message, [Map<String, dynamic>? data]) {
    if (minLevel.index <= LogLevel.info.index) _log('ℹ️', message, data);
  }

  @override
  void warn(String message, [Map<String, dynamic>? data]) {
    if (minLevel.index <= LogLevel.warn.index) _log('⚠️', message, data);
  }

  @override
  void error(String message, [Object? error, StackTrace? stack]) {
    if (minLevel.index <= LogLevel.error.index) {
      _log('🔴', message, null);
      if (error != null) developer.log('   └─ $error', name: 'ERROR');
      if (stack != null) developer.log('   └─ $stack', name: 'ERROR');
    }
  }

  void _log(String prefix, String message, Map<String, dynamic>? data) {
    final buf = StringBuffer('$prefix $message');
    if (data != null) buf.write(' | $data');
    developer.log(buf.toString(), name: 'APP');
  }
}

/// No-op logger for production (no sensitive data printed).
class NoOpLogger implements AppLogger {
  const NoOpLogger();

  @override
  void debug(String message, [Map<String, dynamic>? data]) {}

  @override
  void info(String message, [Map<String, dynamic>? data]) {}

  @override
  void warn(String message, [Map<String, dynamic>? data]) {}

  @override
  void error(String message, [Object? error, StackTrace? stack]) {}
}

enum LogLevel { debug, info, warn, error, none }

/// Structured logging categories for filtering and routing.
///
/// Usage:
/// ```dart
/// AppLogger.log(LoggerKey.auth, 'User logged in', {'uuid': user.id});
/// ```
enum LoggerKey {
  auth,
  apiRequest,
  apiResponse,
  apiError,
  cache,
  nav,
  blocObs,
  websocket,
  connectivity,
}

extension AppLoggerExtension on AppLogger {
  /// Log a message with a named category.
  ///
  /// Category is embedded in the data map so log aggregation tools can
  /// filter by it. In production, category-tagged messages can be routed
  /// to different Sentry breadcrumb types or ignored entirely.
  void log(LoggerKey key, String message, [Map<String, dynamic>? extra]) {
    final data = <String, dynamic>{'category': key.name, if (extra != null) ...extra};
    switch (key) {
      case LoggerKey.apiError:
        error(message, null, null);
      case LoggerKey.apiRequest:
      case LoggerKey.apiResponse:
      case LoggerKey.cache:
      case LoggerKey.websocket:
        debug(message, data);
      case LoggerKey.auth:
      case LoggerKey.nav:
      case LoggerKey.blocObs:
      case LoggerKey.connectivity:
        info(message, data);
    }
  }
}
