import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import '../entities/driver_job.dart';
import '../repositories/driver_repository.dart';

class ManageDelivery {
  const ManageDelivery(this._repository);
  final DriverRepository _repository;

  Future<Either<Failure, Unit>> toggleOnline(bool online) => _repository.toggleOnline(online);
  Future<Either<Failure, DriverJob?>> pollForJob() => _repository.pollForJob();
  Future<Either<Failure, Unit>> acceptJob(String orderUuid) => _repository.acceptJob(orderUuid);
  Future<Either<Failure, Unit>> declineJob(String orderUuid) => _repository.declineJob(orderUuid);
  Future<Either<Failure, Unit>> confirmPickup(String orderUuid) => _repository.confirmPickup(orderUuid);
  Future<Either<Failure, Unit>> startDelivery(String orderUuid) => _repository.startDelivery(orderUuid);
  Future<Either<Failure, Unit>> confirmDelivery(String orderUuid) => _repository.confirmDelivery(orderUuid);
  Future<Either<Failure, DriverEarnings>> getEarnings() => _repository.getEarnings();
}
