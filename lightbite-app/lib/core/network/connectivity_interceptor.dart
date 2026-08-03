import 'package:dio/dio.dart';
import 'package:lightbite_app/core/connectivity/connectivity_service.dart';

/// Rejects requests immediately when the device is offline.
///
/// Instead of waiting for a connection timeout (often 30+ seconds),
/// this interceptor fails fast with a [DioException] of type
/// [DioExceptionType.connectionError] so the repository layer can
/// map it to a [NetworkFailure] via [failure_mapper.dart].
class ConnectivityInterceptor extends Interceptor {
  ConnectivityInterceptor(this._connectivityService);

  final ConnectivityService _connectivityService;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (!_connectivityService.isConnected) {
      handler.reject(
        DioException(
          requestOptions: options,
          type: DioExceptionType.connectionError,
          message: 'No internet connection',
        ),
      );
      return;
    }
    handler.next(options);
  }
}
