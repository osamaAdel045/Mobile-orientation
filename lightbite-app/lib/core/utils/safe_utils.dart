/// Safe access extensions on List, String, and Enum iterables.

extension SafeList<E> on List<E> {
  E? safeElementAt(int index) {
    if (index < length && index >= 0) return elementAt(index);
    return null;
  }

  E? get safeFirst => isNotEmpty ? first : null;

  E? get safeLast => isNotEmpty ? last : null;

  List<E> safeSublist(int start, [int? end]) {
    try {
      return sublist(start, end);
    } catch (_) {
      return this;
    }
  }

  E? safeFirstWhere(bool Function(E e) predicate) {
    if (any(predicate)) return firstWhere(predicate);
    return null;
  }

  int? safeFirstIndexWhere(bool Function(E e) predicate) {
    if (any(predicate)) return indexWhere(predicate);
    return null;
  }

  E? safeLastWhere(bool Function(E e) predicate) {
    if (any(predicate)) return lastWhere(predicate);
    return null;
  }

  int? safeLastIndexWhere(bool Function(E e) predicate) {
    if (any(predicate)) return lastIndexWhere(predicate);
    return null;
  }

  E? safeRemoveAt(int index) {
    try {
      return removeAt(index);
    } catch (_) {
      return null;
    }
  }

  E? safeRemoveLast() {
    try {
      return removeLast();
    } catch (_) {
      return null;
    }
  }
}

extension SafeString on String {
  /// Splits the string by [pattern]. Returns [] if the pattern is not found.
  List<String> safeSplit(Pattern pattern) {
    if (contains(pattern)) return split(pattern);
    return [];
  }
}

extension EnumByName<E extends Enum> on Iterable<E> {
  /// Returns the first element whose [name] matches [name], or null.
  E? safeByName(String name) {
    if (any((e) => e.name == name)) return byName(name);
    return null;
  }
}
