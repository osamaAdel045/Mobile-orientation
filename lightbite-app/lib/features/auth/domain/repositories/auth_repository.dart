import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/domain/entities/auth_user.dart';
import 'package:lightbite_app/core/errors/failures.dart';

abstract class AuthRepository {
  Future<AuthUser?> checkAuth();
  Future<Either<Failure, AuthUser>> login(String email, String password);
  Future<Either<Failure, AuthUser>> register(String name, String email, String password, String role);
  Future<void> logout();
}
