import 'package:dio/dio.dart';
import 'package:lightbite_app/core/bus/app_events.dart';
import 'package:lightbite_app/core/bus/event_bus.dart';
import '../storage/secure_storage.dart';

/// Dio interceptor that handles token refresh on 401 responses.
///
/// Implements a queue-safe refresh mechanism: when multiple concurrent
/// requests receive 401, only one refresh call is made. Queued requests
/// are retried after the refresh succeeds, or all fail if it fails.
class RefreshInterceptor extends Interceptor {
  RefreshInterceptor(this._storage, this._dio);

  final SecureStorage _storage;
  final Dio _dio;

  /// Prevents concurrent refresh attempts.
  bool _isRefreshing = false;

  /// Requests that arrived while a refresh was in progress.
  final List<({DioException error, ErrorInterceptorHandler handler})>
      _pendingQueue = [];

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }

    // Don't retry the refresh endpoint itself — avoids infinite loop
    if (err.requestOptions.path == '/auth/refresh') {
      await _storage.clearAll();
      return handler.next(err);
    }

    // Queue this request if a refresh is already in progress
    if (_isRefreshing) {
      _pendingQueue.add((error: err, handler: handler));
      return;
    }

    _isRefreshing = true;
    try {
      final refreshToken = await _storage.getRefreshToken();
      if (refreshToken == null) {
        await _storage.clearAll();
        appBus.fire(const SessionExpiredEvent());
        return handler.next(err);
      }

      final response = await Dio(
        BaseOptions(baseUrl: _dio.options.baseUrl),
      ).post('/auth/refresh', data: {'refresh_token': refreshToken});

      final newToken = response.data['data']['access_token'] as String;
      final newRefresh = response.data['data']['refresh_token'] as String?;

      await _storage.saveToken(newToken);
      if (newRefresh != null) {
        await _storage.saveRefreshToken(newRefresh);
      }

      // Retry the original request with new token
      final retryOptions = err.requestOptions;
      retryOptions.headers['Authorization'] = 'Bearer $newToken';
      final retryResponse = await _dio.fetch(retryOptions);
      handler.resolve(retryResponse);

      // Retry all queued requests
      for (final entry in _pendingQueue) {
        final retryOpts = entry.error.requestOptions;
        retryOpts.headers['Authorization'] = 'Bearer $newToken';
        final queuedRetry = await _dio.fetch(retryOpts);
        entry.handler.resolve(queuedRetry);
      }
    } on DioException catch (refreshErr) {
      // Only clear session if the refresh endpoint itself returned 401.
      // Network errors should NOT log the user out.
      if (refreshErr.response?.statusCode == 401) {
        await _storage.clearAll();
        appBus.fire(const SessionExpiredEvent());
      }
      // Fail the original request
      handler.next(err);
      // Fail all queued requests
      for (final entry in _pendingQueue) {
        entry.handler.next(entry.error);
      }
    } catch (_) {
      // Unexpected error (parse, runtime) — don't log out, just fail.
      handler.next(err);
      for (final entry in _pendingQueue) {
        entry.handler.next(entry.error);
      }
    } finally {
      _isRefreshing = false;
      _pendingQueue.clear();
    }
  }
}
