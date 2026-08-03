import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import '../entities/address.dart';

abstract class AddressRepository {
  Future<Either<Failure, List<Address>>> getAddresses();
  Future<Either<Failure, Address>> createAddress(String label, String address, bool isDefault, {double? lat, double? lng});
  Future<Either<Failure, Address>> updateAddress(String uuid, String label, String address, bool isDefault);
  Future<Either<Failure, Unit>> deleteAddress(String uuid);
}
