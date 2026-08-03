import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import '../entities/driver_job.dart';

abstract class DriverRepository {
  Future<Either<Failure, Unit>> toggleOnline(bool online);
  Future<Either<Failure, DriverJob?>> pollForJob();
  Future<Either<Failure, Unit>> acceptJob(String orderUuid);
  Future<Either<Failure, Unit>> declineJob(String orderUuid);
  Future<Either<Failure, Unit>> confirmPickup(String orderUuid);
  Future<Either<Failure, Unit>> startDelivery(String orderUuid);
  Future<Either<Failure, Unit>> confirmDelivery(String orderUuid);
  Future<Either<Failure, DriverEarnings>> getEarnings();
}
