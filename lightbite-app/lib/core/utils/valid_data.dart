import 'safe_utils.dart';

// ─── Predicate checkers ──────────────────────────────────────

/// Returns true if [src] is a non-empty string and not the literal strings "false" or "null".
bool validString(dynamic src) =>
    src?.toString().trim().isNotEmpty == true &&
    src?.toString().trim() != 'false' &&
    src?.toString().trim() != 'null';

/// Returns true if [o] is a non-null bool.
bool validBool(dynamic o) => o != null && o is bool;

/// Returns true if [src] is a non-null, non-empty List<E>.
bool validList<E>(dynamic src) => src != null && src is List<E> && src.isNotEmpty;

/// Returns true if [src] is a non-null, non-empty Map<K, V>.
bool validMap<K, V>(dynamic src) => src != null && src is Map<K, V> && src.isNotEmpty;

/// Returns true if [src] parses as an integer.
bool validInt(dynamic src) => int.tryParse(src.toString()) != null;

/// Returns true if [src] parses as a double.
bool validDouble(dynamic src) =>
    double.tryParse(validateString(src)) != null;

// ─── Safe accessors (never return null) ──────────────────────

/// Always returns a String. Missing/invalid values return [def] (default '').
String validateString(dynamic src, [String def = '']) =>
    validString(src) ? src.toString() : def;

/// Always returns a bool. Missing/invalid values return [def] (default false).
bool validateBool(dynamic o, [bool def = false]) =>
    validBool(o) ? o : def;

/// Always returns a List<E>. Missing/invalid values return [def] (default []).
List<E> validateList<E>(dynamic src, [List<E> def = const []]) =>
    validList(src) ? (src as List).safeCast<E>() : def;

/// Always returns a Map<K, V>. Missing/invalid values return [def] (default {}).
Map<K, V> validateMap<K, V>(dynamic src, [Map<K, V> def = const {}]) =>
    validMap(src) ? src : def;

/// Always returns an int. Missing/invalid values return [def] (default 0).
int validateInt(dynamic src, [int def = 0]) =>
    int.tryParse(validateString(src?.toString())) ?? def;

/// Always returns a double. Missing/invalid values return [def] (default 0.0).
double validateDouble(dynamic src, [double def = 0]) =>
    double.tryParse(validateString(src)) ?? def;

/// Parses an enum value by name. Falls back to [def] or the first enum value.
E validateEnum<E extends Enum>(List<E> enums, dynamic src, [E? def]) =>
    enums.safeFirstWhere((e) => e.name == src.toString()) ??
    (def ?? enums.first);

/// Parses an enum value by name. Returns null if no match.
E? validateEnumNullable<E extends Enum>(List<E> enums, dynamic src) =>
    enums.safeFirstWhere((e) => e.name == src.toString());

// ─── Boolean helpers ─────────────────────────────────────────

/// Returns true if src is the string "true" or "1".
bool isTrue(dynamic src) =>
    src?.toString() == 'true' || src?.toString() == '1';

// ─── JSON helpers ────────────────────────────────────────────

/// Parses a nested JSON object. Returns null if the source is not a valid map.
T? validateJson<T>(
  dynamic src,
  T Function(Map<String, dynamic> json) fromJson,
) =>
    validMap<String, dynamic>(src) ? fromJson(src) : null;

/// Parses a list of JSON objects. Silently skips non-map entries.
/// Always returns a list (empty on failure).
List<T> validateJsonList<T>(
  dynamic src,
  T Function(Map<String, dynamic> e) fromJson,
) {
  if (src != null && src is List && src.isNotEmpty) {
    return src
        .whereType<Map<String, dynamic>>()
        .map((e) => fromJson(e))
        .toList();
  }
  return <T>[];
}

/// Extension ───────────────────────────────────────────────

extension ListSafeCast on List {
  /// Safe cast — returns the original list if casting fails.
  List<T> safeCast<T>() {
    try {
      return map((e) => e as T).toList();
    } on TypeError catch (_) {
      return <T>[];
    }
  }
}
