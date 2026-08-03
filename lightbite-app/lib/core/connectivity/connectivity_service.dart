import 'dart:async';

/// Abstract interface for monitoring device network connectivity.
///
/// Implementations wrap platform-specific connectivity APIs
/// (e.g., [connectivity_plus]) and expose a reactive stream.
abstract class ConnectivityService {
  /// Whether the device currently has network access.
  bool get isConnected;

  /// A broadcast stream that emits `true` when online, `false` when offline.
  Stream<bool> get onConnectivityChanged;

  /// Start listening for connectivity changes.
  Future<void> init();

  /// Clean up subscriptions and close the stream.
  void dispose();
}
