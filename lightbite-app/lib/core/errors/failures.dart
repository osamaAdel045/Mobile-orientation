/// Base class for all domain-layer failures.
///
/// Failures represent expected error states that the presentation layer
/// must handle. They are returned via [Either] from repositories and
/// use cases — never thrown as exceptions across layer boundaries.
sealed class Failure {
  const Failure();

  /// Human-readable message suitable for display or logging.
  String get message;
}

/// A failure caused by network unavailability or timeout.
final class NetworkFailure extends Failure {
  const NetworkFailure([this.message = 'No internet connection. Check your network and try again.']);
  @override
  final String message;
}

/// A failure returned by the server (5xx, malformed response, etc.).
final class ServerFailure extends Failure {
  const ServerFailure([this.message = 'Something went wrong on our end. Please try again later.']);
  @override
  final String message;
}

/// A failure caused by an authentication or authorization problem (401, 403).
final class AuthFailure extends Failure {
  const AuthFailure([this.message = 'Your session has expired. Please log in again.']);
  @override
  final String message;
}

/// A failure caused by invalid user input or missing required fields.
final class ValidationFailure extends Failure {
  const ValidationFailure(this.message);
  @override
  final String message;
}

/// A failure returned when a requested resource is not found (404).
final class NotFoundFailure extends Failure {
  const NotFoundFailure([this.message = 'The requested resource was not found.']);
  @override
  final String message;
}

/// A failure caused by local storage or cache errors.
final class CacheFailure extends Failure {
  const CacheFailure([this.message = 'Could not read or write local data.']);
  @override
  final String message;
}
