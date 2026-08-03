import 'package:event_bus/event_bus.dart';

/// Global application event bus.
///
/// Use for cross-cutting events that need to be observed by multiple
/// independent parts of the system (e.g., session expiry → auth cubit,
/// connectivity change → offline banner).
///
/// Usage:
/// ```dart
/// // Fire
/// appBus.fire(const SessionExpiredEvent());
///
/// // Listen
/// appBus.on<SessionExpiredEvent>().listen((_) => logout());
/// ```
final appBus = EventBus();
