import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/core/errors/failure_mapper.dart';
import 'package:lightbite_app/features/customer/home/domain/entities/restaurant.dart';
import 'package:lightbite_app/features/customer/home/domain/repositories/home_repository.dart';
import '../datasources/home_remote_datasource.dart';

class HomeRepositoryImpl implements HomeRepository {
  HomeRepositoryImpl(this._dataSource);

  final HomeRemoteDataSource _dataSource;

  @override
  Future<Either<Failure, List<Restaurant>>> getNearbyRestaurants(double lat, double lng) async {
    try {
      final models = await _dataSource.getNearbyRestaurants(lat, lng);
      return Right(models.map((m) => m.toEntity()).toList());
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to load restaurants. Please try again.'));
    }
  }

  @override
  Future<Either<Failure, List<Restaurant>>> searchRestaurants(String query, {String? cuisine}) async {
    try {
      final models = await _dataSource.searchRestaurants(query, cuisine: cuisine);
      return Right(models.map((m) => m.toEntity()).toList());
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Search failed. Please try again.'));
    }
  }
}
