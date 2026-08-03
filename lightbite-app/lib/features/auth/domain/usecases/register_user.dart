import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/domain/entities/auth_user.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/features/auth/domain/repositories/auth_repository.dart';

class RegisterParams {
  final String name;
  final String email;
  final String password;
  final String role;
  const RegisterParams({required this.name, required this.email, required this.password, required this.role});
}

class RegisterUser {
  const RegisterUser(this._repository);
  final AuthRepository _repository;

  Future<Either<Failure, AuthUser>> call(RegisterParams params) =>
      _repository.register(params.name, params.email, params.password, params.role);
}
