/// Fired when the session token is expired or invalidated.
///
/// Any subscriber (Cubit, service) that holds user-specific state should
/// listen for this event and clear its state — typically triggering a
/// redirect to the login screen.
class SessionExpiredEvent {
  const SessionExpiredEvent();
}

/// Fired when device connectivity changes.
///
/// Carries the current connectivity status so subscribers can react
/// immediately without re-querying [ConnectivityService].
class ConnectivityChangedEvent {
  const ConnectivityChangedEvent(this.isConnected);
  final bool isConnected;
}
