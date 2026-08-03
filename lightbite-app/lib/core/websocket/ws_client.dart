import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../config/app_environment.dart';

class WsClient {
  WsClient({AppEnvironmentConfig? config})
      : _config = config ?? AppEnvironmentConfig.current;

  final AppEnvironmentConfig _config;
  WebSocketChannel? _channel;
  StreamSubscription? _subscription;
  final _controllers = <String, StreamController<Map<String, dynamic>>>{};
  bool _connected = false;
  String? _token;
  Timer? _reconnectTimer;
  int _reconnectAttempts = 0;
  static const int _maxReconnectDelaySeconds = 60;

  /// Connect to the WebSocket server.
  ///
  /// The [token] is sent as the first message after connecting, not in the URL
  /// query string, to avoid leaking it in server access logs.
  Future<void> connect(String token) async {
    _token = token;
    _reconnectAttempts = 0;
    await _doConnect();
  }

  Future<void> _doConnect() async {
    try {
      await _disconnectInternal();
      _channel = WebSocketChannel.connect(Uri.parse(_config.wsUrl));
      _connected = true;

      // Authenticate via first message, not URL query parameter
      if (_token != null) {
        _channel!.sink.add(jsonEncode({'event': 'auth', 'token': _token}));
      }

      _subscription = _channel!.stream.listen(
        (data) {
          try {
            final message =
                jsonDecode(data as String) as Map<String, dynamic>;
            final event = message['event'] as String? ?? 'unknown';
            _controllers[event]?.add(message);
          } catch (_) {
            // Ignore malformed messages
          }
        },
        onError: (error) {
          _connected = false;
          _scheduleReconnect();
        },
        onDone: () {
          _connected = false;
          _scheduleReconnect();
        },
      );

      // Reset reconnect backoff on successful connection
      _reconnectAttempts = 0;
    } catch (_) {
      _connected = false;
      _scheduleReconnect();
    }
  }

  void _scheduleReconnect() {
    if (_token == null) return;
    _reconnectTimer?.cancel();
    // Exponential backoff: 2s → 4s → 8s → 16s → 32s → 60s (max)
    final delay = min(
      pow(2, _reconnectAttempts + 1).toInt(),
      _maxReconnectDelaySeconds,
    );
    _reconnectAttempts++;
    _reconnectTimer = Timer(Duration(seconds: delay), _doConnect);
  }

  Stream<Map<String, dynamic>> on(String event) {
    _controllers.putIfAbsent(
      event,
      () => StreamController<Map<String, dynamic>>.broadcast(),
    );
    return _controllers[event]!.stream;
  }

  void send(Map<String, dynamic> data) {
    if (_connected && _channel != null) {
      _channel!.sink.add(jsonEncode(data));
    }
  }

  /// Call when the app goes to background to conserve battery.
  void pause() {
    _disconnectInternal();
    _reconnectTimer?.cancel();
  }

  /// Call when the app returns to foreground.
  void resume() {
    if (_token != null) {
      _doConnect();
    }
  }

  bool get isConnected => _connected;

  Future<void> _disconnectInternal() async {
    await _subscription?.cancel();
    await _channel?.sink.close();
    _connected = false;
  }

  Future<void> disconnect() async {
    _reconnectTimer?.cancel();
    _token = null;
    _reconnectAttempts = 0;
    await _disconnectInternal();
    for (final c in _controllers.values) {
      await c.close();
    }
    _controllers.clear();
  }
}
