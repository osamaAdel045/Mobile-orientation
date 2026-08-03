import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/features/customer/address/domain/entities/address.dart';
import 'package:lightbite_app/features/customer/address/domain/repositories/address_repository.dart';

class ManageAddresses {
  const ManageAddresses(this._repository);
  final AddressRepository _repository;

  Future<Either<Failure, List<Address>>> getAll() => _repository.getAddresses();

  Future<Either<Failure, Address>> create({
    required String label,
    required String address,
    required bool isDefault,
    double? lat,
    double? lng,
  }) => _repository.createAddress(label, address, isDefault, lat: lat, lng: lng);

  Future<Either<Failure, Address>> update({
    required String uuid,
    required String label,
    required String address,
    required bool isDefault,
  }) => _repository.updateAddress(uuid, label, address, isDefault);

  Future<Either<Failure, Unit>> delete(String uuid) => _repository.deleteAddress(uuid);
}
