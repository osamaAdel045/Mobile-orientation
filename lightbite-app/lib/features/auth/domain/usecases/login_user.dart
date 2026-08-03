import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/domain/entities/auth_user.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/features/auth/domain/repositories/auth_repository.dart';

class LoginParams {
  final String email;
  final String password;
  const LoginParams({required this.email, required this.password});
}

class LoginUser {
  const LoginUser(this._repository);
  final AuthRepository _repository;

  Future<Either<Failure, AuthUser>> call(LoginParams params) =>
      _repository.login(params.email, params.password);
}
