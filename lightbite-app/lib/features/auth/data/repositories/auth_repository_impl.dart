import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:lightbite_app/core/domain/entities/auth_user.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/core/errors/failure_mapper.dart';
import 'package:lightbite_app/features/auth/domain/repositories/auth_repository.dart';
import '../datasources/auth_local_datasource.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._remote, this._local);

  final AuthRemoteDataSource _remote;
  final AuthLocalDataSource _local;

  @override
  Future<AuthUser?> checkAuth() async {
    final token = await _local.getToken();
    if (token == null || token.isEmpty) return null;
    return _local.getUser();
  }

  @override
  Future<Either<Failure, AuthUser>> login(String email, String password) async {
    try {
      final response = await _remote.login(email, password);
      await _local.saveToken(response.accessToken);
      await _local.saveRefreshToken(response.refreshToken);
      final user = response.user.toEntity();
      await _local.saveUser(user);
      return Right(user);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('An unexpected error occurred.'));
    }
  }

  @override
  Future<Either<Failure, AuthUser>> register(
      String name, String email, String password, String role) async {
    try {
      final response = await _remote.register(name, email, password, role);
      await _local.saveToken(response.accessToken);
      await _local.saveRefreshToken(response.refreshToken);
      final user = response.user.toEntity();
      await _local.saveUser(user);
      return Right(user);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('An unexpected error occurred.'));
    }
  }

  @override
  Future<void> logout() async {
    await _local.clearAll();
  }
}
