import 'package:hive_flutter/hive_flutter.dart';

/// Typed local cache backed by Hive.
///
/// Dart built-in types (String, int, double, bool, List, Map) are stored
/// directly via Hive's native binary format — no JSON encoding overhead.
///
/// Usage:
/// ```dart
/// await LocalCache.init();
/// await LocalCache.putString('last_search', 'pizza');
/// final query = LocalCache.getString('last_search');
/// ```
class LocalCache {
  LocalCache._();

  static const _defaultBox = 'lightbite_cache';

  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(_defaultBox);
  }

  static Box _box(String name) => Hive.box(name);

  // ── String ──

  static Future<void> putString(String key, String value) async {
    await _box(_defaultBox).put(key, value);
  }

  static String? getString(String key) => _box(_defaultBox).get(key) as String?;

  // ── int ──

  static Future<void> putInt(String key, int value) async {
    await _box(_defaultBox).put(key, value);
  }

  static int? getInt(String key) => _box(_defaultBox).get(key) as int?;

  // ── double ──

  static Future<void> putDouble(String key, double value) async {
    await _box(_defaultBox).put(key, value);
  }

  static double? getDouble(String key) => _box(_defaultBox).get(key) as double?;

  // ── bool ──

  static Future<void> putBool(String key, bool value) async {
    await _box(_defaultBox).put(key, value);
  }

  static bool? getBool(String key) => _box(_defaultBox).get(key) as bool?;

  // ── List ──

  static Future<void> putList(String key, List value) async {
    await _box(_defaultBox).put(key, value);
  }

  static List? getList(String key) => _box(_defaultBox).get(key) as List?;

  // ── Map ──

  static Future<void> putMap(String key, Map<String, dynamic> value) async {
    await _box(_defaultBox).put(key, value);
  }

  static Map<String, dynamic>? getMap(String key) {
    final value = _box(_defaultBox).get(key);
    if (value is Map) {
      return value.cast<String, dynamic>();
    }
    return null;
  }

  // ── Generic (use sparingly — prefer typed methods above) ──

  static Future<void> put(String key, dynamic value) async {
    await _box(_defaultBox).put(key, value);
  }

  static T? get<T>(String key) => _box(_defaultBox).get(key) as T?;

  // ── Utility ──

  static Future<void> remove(String key) async {
    await _box(_defaultBox).delete(key);
  }

  static Future<void> clear() async {
    await _box(_defaultBox).clear();
  }

  static bool containsKey(String key) => _box(_defaultBox).containsKey(key);
}
