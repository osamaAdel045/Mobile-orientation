import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/core/errors/failure_mapper.dart';
import '../../domain/entities/theme_config.dart';
import '../../domain/repositories/theme_repository.dart';
import '../datasources/theme_remote_datasource.dart';

class ThemeRepositoryImpl implements ThemeRepository {
  ThemeRepositoryImpl(this._remoteDataSource);

  final ThemeRemoteDataSource _remoteDataSource;

  @override
  Future<Either<Failure, ThemeConfig>> getThemeConfig() async {
    try {
      final config = await _remoteDataSource.fetchThemeConfig();
      return Right(config);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } on Object {
      return const Left(ServerFailure('Unexpected error while loading theme.'));
    }
  }
}
