class ApiException implements Exception {
  ApiException(this.message, {this.statusCode, this.errors});

  final String message;
  final int? statusCode;
  final Map<String, dynamic>? errors;

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class NetworkException extends ApiException {
  NetworkException(super.message, {super.statusCode});
}

class UnauthorizedException extends ApiException {
  UnauthorizedException([super.message = 'Session expired. Please login again.'])
      : super(statusCode: 401);
}

class NotFoundException extends ApiException {
  NotFoundException([super.message = 'Resource not found'])
      : super(statusCode: 404);
}

class ServerException extends ApiException {
  ServerException([super.message = 'Server error. Please try again.'])
      : super(statusCode: 500);
}
