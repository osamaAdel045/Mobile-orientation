import '../models/auth_models.dart';

abstract class AuthRemoteDataSource {
  Future<AuthResponseModel> login(String email, String password);
  Future<AuthResponseModel> register(
      String name, String email, String password, String role);
}
