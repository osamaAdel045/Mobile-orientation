import '../../../../core/network/api_client.dart';
import '../models/auth_models.dart';
import 'auth_remote_datasource.dart';

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  AuthRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<AuthResponseModel> login(String email, String password) async {
    final response = await _client.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return AuthResponseModel.fromJson(
        response.data['data'] as Map<String, dynamic>);
  }

  @override
  Future<AuthResponseModel> register(
      String name, String email, String password, String role) async {
    final response = await _client.post('/auth/register', data: {
      'name': name,
      'email': email,
      'password': password,
      'role': role,
    });
    return AuthResponseModel.fromJson(
        response.data['data'] as Map<String, dynamic>);
  }
}
