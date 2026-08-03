import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:lightbite_app/core/connectivity/connectivity_service.dart';
import '../config/app_environment.dart';
import '../storage/secure_storage.dart';
import 'auth_interceptor.dart';
import 'connectivity_interceptor.dart';
import 'refresh_interceptor.dart';

class ApiClient {
  ApiClient(this._storage, {AppEnvironmentConfig? config, ConnectivityService? connectivity})
      : _config = config ?? AppEnvironmentConfig.current,
        _connectivity = connectivity;

  final SecureStorage _storage;
  final AppEnvironmentConfig _config;
  final ConnectivityService? _connectivity;
  late final Dio _dio;

  void init() {
    _dio = Dio(
      BaseOptions(
        baseUrl: _config.apiBaseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: const {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ),
    );

    final interceptors = <Interceptor>[
      if (_connectivity != null) ConnectivityInterceptor(_connectivity!),
      AuthInterceptor(_storage),
      RefreshInterceptor(_storage, _dio),
    ];

    // cURL logging in debug builds for easy API debugging
    if (_config.enableApiLogging) {
      interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (o) => debugPrint('[API] $o'),
      ));
    }

    _dio.interceptors.addAll(interceptors);
  }

  Dio get dio => _dio;

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) =>
      _dio.get(path, queryParameters: queryParameters);

  Future<Response> post(String path, {dynamic data, Map<String, dynamic>? headers}) =>
      _dio.post(path, data: data, options: headers != null ? Options(headers: headers) : null);

  Future<Response> put(String path, {dynamic data}) =>
      _dio.put(path, data: data);

  Future<Response> patch(String path, {dynamic data}) =>
      _dio.patch(path, data: data);

  Future<Response> delete(String path) => _dio.delete(path);
}
