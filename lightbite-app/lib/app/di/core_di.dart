import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:lightbite_app/core/connectivity/connectivity_service.dart';
import 'package:lightbite_app/core/connectivity/connectivity_service_impl.dart';
import 'package:lightbite_app/core/error_tracking/error_tracker.dart';
import 'package:lightbite_app/core/logger/app_logger.dart';
import 'package:lightbite_app/core/network/api_client.dart';
import 'package:lightbite_app/core/storage/secure_storage.dart';
import 'package:lightbite_app/core/websocket/ws_client.dart';
import 'injection_container.dart';

void registerCore() {
  sl.registerLazySingleton<AppLogger>(() => const PrintLogger());
  sl.registerLazySingleton<ErrorTracker>(() => ConsoleErrorTracker(sl<AppLogger>()));

  final connectivityService = ConnectivityServiceImpl();
  connectivityService.init();
  sl.registerSingleton<ConnectivityService>(connectivityService);

  final storage = SecureStorage(const FlutterSecureStorage());
  sl.registerLazySingleton<SecureStorage>(() => storage);

  final apiClient = ApiClient(storage, connectivity: connectivityService);
  apiClient.init();
  sl.registerLazySingleton<ApiClient>(() => apiClient);

  sl.registerLazySingleton<WsClient>(() => WsClient());
}
