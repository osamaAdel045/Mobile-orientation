import 'package:dio/dio.dart';
import 'package:lightbite_app/core/errors/failures.dart';

/// Maps low-level [DioException] instances into typed [Failure] subclasses.
///
/// This keeps the mapping logic in one place so every repository
/// implementation doesn't duplicate DioException → Failure conversion.
Failure mapDioExceptionToFailure(DioException exception) {
  switch (exception.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
      return const NetworkFailure('The request timed out. Please try again.');
    case DioExceptionType.connectionError:
      return const NetworkFailure();
    case DioExceptionType.badResponse:
      final statusCode = exception.response?.statusCode;
      if (statusCode == 401 || statusCode == 403) {
        return const AuthFailure();
      }
      if (statusCode == 404) {
        return const NotFoundFailure();
      }
      if (statusCode != null && statusCode >= 500) {
        return const ServerFailure();
      }
      return ServerFailure(
        _extractMessage(exception.response?.data) ?? 'Unexpected server response.',
      );
    case DioExceptionType.badCertificate:
      return const NetworkFailure('Secure connection could not be established.');
    case DioExceptionType.cancel:
      return const NetworkFailure('Request was cancelled.');
    case DioExceptionType.unknown:
    case DioExceptionType.transformTimeout:
      return ServerFailure(
        exception.message ?? 'An unexpected error occurred.',
      );
  }
}

String? _extractMessage(dynamic data) {
  if (data is Map) {
    return data['message'] as String? ?? data['error'] as String?;
  }
  return null;
}
