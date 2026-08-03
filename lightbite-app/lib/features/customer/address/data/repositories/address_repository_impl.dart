import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/core/config/app_environment.dart';
import 'package:lightbite_app/core/errors/failure_mapper.dart';
import 'package:lightbite_app/features/customer/address/domain/entities/address.dart';
import 'package:lightbite_app/features/customer/address/domain/repositories/address_repository.dart';
import '../datasources/address_remote_datasource.dart';

class AddressRepositoryImpl implements AddressRepository {
  AddressRepositoryImpl(this._dataSource);
  final AddressRemoteDataSource _dataSource;

  @override
  Future<Either<Failure, List<Address>>> getAddresses() async {
    try {
      final data = await _dataSource.getAddresses();
      return Right(data.map(_mapAddress).toList());
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to load addresses.'));
    }
  }

  @override
  Future<Either<Failure, Address>> createAddress(String label, String address, bool isDefault, {double? lat, double? lng}) async {
    try {
      final data = await _dataSource.createAddress({
        'label': label, 'address': address, 'is_default': isDefault,
        'lat': lat ?? AppEnvironmentConfig.defaultLat,
        'lng': lng ?? AppEnvironmentConfig.defaultLng,
      });
      return Right(_mapAddress(data));
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to create address.'));
    }
  }

  @override
  Future<Either<Failure, Address>> updateAddress(String uuid, String label, String address, bool isDefault) async {
    try {
      final data = await _dataSource.updateAddress(uuid, {
        'label': label, 'address': address, 'is_default': isDefault,
      });
      return Right(_mapAddress(data));
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to update address.'));
    }
  }

  @override
  Future<Either<Failure, Unit>> deleteAddress(String uuid) async {
    try {
      await _dataSource.deleteAddress(uuid);
      return const Right(unit);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to delete address.'));
    }
  }

  Address _mapAddress(Map<String, dynamic> data) => Address(
    uuid: data['uuid'] as String,
    label: data['label'] as String? ?? '',
    address: data['address'] as String? ?? '',
    lat: (data['lat'] as num?)?.toDouble(),
    lng: (data['lng'] as num?)?.toDouble(),
    isDefault: data['is_default'] == true,
  );
}
