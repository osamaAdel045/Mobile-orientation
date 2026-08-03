import 'dart:convert';
import '../../../../core/storage/secure_storage.dart';
import '../../../../core/domain/entities/auth_user.dart';

abstract class AuthLocalDataSource {
  Future<void> saveToken(String token);
  Future<String?> getToken();
  Future<void> saveRefreshToken(String token);
  Future<String?> getRefreshToken();
  Future<void> saveUser(AuthUser user);
  Future<AuthUser?> getUser();
  Future<void> clearAll();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  AuthLocalDataSourceImpl(this._storage);

  final SecureStorage _storage;

  @override
  Future<void> saveToken(String token) => _storage.saveToken(token);

  @override
  Future<String?> getToken() => _storage.getToken();

  @override
  Future<void> saveRefreshToken(String token) =>
      _storage.saveRefreshToken(token);

  @override
  Future<String?> getRefreshToken() => _storage.getRefreshToken();

  @override
  Future<void> saveUser(AuthUser user) async {
    await _storage.saveUserData(jsonEncode(user.toJson()));
  }

  @override
  Future<AuthUser?> getUser() async {
    final data = await _storage.getUserData();
    if (data == null) return null;
    try {
      final json = jsonDecode(data) as Map<String, dynamic>;
      return AuthUser.fromJson(json);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> clearAll() => _storage.clearAll();
}
