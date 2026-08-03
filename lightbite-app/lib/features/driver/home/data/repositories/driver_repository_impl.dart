import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/core/errors/failure_mapper.dart';
import 'package:lightbite_app/features/driver/home/domain/entities/driver_job.dart';
import 'package:lightbite_app/features/driver/home/domain/repositories/driver_repository.dart';
import '../datasources/driver_remote_datasource.dart';
import '../models/driver_models.dart';

class DriverRepositoryImpl implements DriverRepository {
  DriverRepositoryImpl(this._dataSource);
  final DriverRemoteDataSource _dataSource;

  @override
  Future<Either<Failure, Unit>> toggleOnline(bool online) async {
    try {
      await _dataSource.toggleOnline(online);
      return const Right(unit);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to toggle online status.'));
    }
  }

  @override
  Future<Either<Failure, DriverJob?>> pollForJob() async {
    try {
      final data = await _dataSource.getDriverHome();
      final pendingJobs = data['pending_jobs'] as List<dynamic>?;
      if (pendingJobs != null && pendingJobs.isNotEmpty) {
        return Right(DriverJobModel.fromJson(
          pendingJobs.first as Map<String, dynamic>,
        ).toEntity());
      }
      return const Right(null);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to poll for jobs.'));
    }
  }

  @override
  Future<Either<Failure, Unit>> acceptJob(String orderUuid) async {
    try {
      await _dataSource.acceptJob(orderUuid);
      return const Right(unit);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to accept job.'));
    }
  }

  @override
  Future<Either<Failure, Unit>> declineJob(String orderUuid) async {
    try {
      await _dataSource.declineJob(orderUuid);
      return const Right(unit);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to decline job.'));
    }
  }

  @override
  Future<Either<Failure, Unit>> confirmPickup(String orderUuid) async {
    try {
      await _dataSource.confirmPickup(orderUuid);
      return const Right(unit);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to confirm pickup.'));
    }
  }

  @override
  Future<Either<Failure, Unit>> startDelivery(String orderUuid) async {
    try {
      await _dataSource.startDelivery(orderUuid);
      return const Right(unit);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to start delivery.'));
    }
  }

  @override
  Future<Either<Failure, Unit>> confirmDelivery(String orderUuid) async {
    try {
      await _dataSource.confirmDelivery(orderUuid);
      return const Right(unit);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to confirm delivery.'));
    }
  }

  @override
  Future<Either<Failure, DriverEarnings>> getEarnings() async {
    try {
      final model = await _dataSource.getEarnings();
      return Right(model.toEntity());
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to load earnings.'));
    }
  }
}
