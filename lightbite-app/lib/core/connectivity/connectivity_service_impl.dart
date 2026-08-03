import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:lightbite_app/core/bus/app_events.dart';
import 'package:lightbite_app/core/bus/event_bus.dart';
import 'package:lightbite_app/core/connectivity/connectivity_service.dart';

/// Platform implementation of [ConnectivityService] using `connectivity_plus`.
class ConnectivityServiceImpl implements ConnectivityService {
  ConnectivityServiceImpl({Connectivity? connectivity})
      : _connectivity = connectivity ?? Connectivity();

  final Connectivity _connectivity;
  final _controller = StreamController<bool>.broadcast();

  StreamSubscription<List<ConnectivityResult>>? _subscription;

  ConnectivityResult _lastResult = ConnectivityResult.wifi;

  @override
  bool get isConnected => _lastResult != ConnectivityResult.none;

  @override
  Stream<bool> get onConnectivityChanged => _controller.stream;

  @override
  Future<void> init() async {
    final results = await _connectivity.checkConnectivity();
    _lastResult = results.isNotEmpty ? results.first : ConnectivityResult.none;

    _subscription = _connectivity.onConnectivityChanged.listen((results) {
      final result = results.isNotEmpty ? results.first : ConnectivityResult.none;
      _lastResult = result;
      final connected = result != ConnectivityResult.none;
      _controller.add(connected);
      appBus.fire(ConnectivityChangedEvent(connected));
    });
  }

  @override
  void dispose() {
    _subscription?.cancel();
    _controller.close();
  }
}
