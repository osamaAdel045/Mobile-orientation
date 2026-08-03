import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/core/errors/failure_mapper.dart';
import 'package:lightbite_app/features/customer/cart/domain/entities/cart_item.dart';
import 'package:lightbite_app/features/customer/cart/domain/repositories/cart_repository.dart';
import '../datasources/cart_remote_datasource.dart';

class CartRepositoryImpl implements CartRepository {
  CartRepositoryImpl(this._dataSource);
  final CartRemoteDataSource _dataSource;

  @override
  Future<Either<Failure, Cart>> getCart() async {
    try {
      final model = await _dataSource.getCart();
      return Right(model.toEntity());
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to load cart.'));
    }
  }

  @override
  Future<Either<Failure, Cart>> addItem(String menuItemUuid, int quantity, String? instructions) async {
    try {
      final model = await _dataSource.addItem(menuItemUuid, quantity, instructions);
      return Right(model.toEntity());
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to add item.'));
    }
  }

  @override
  Future<Either<Failure, Cart>> updateItem(int itemId, int quantity) async {
    try {
      final model = await _dataSource.updateItem(itemId, quantity);
      return Right(model.toEntity());
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to update item.'));
    }
  }

  @override
  Future<Either<Failure, Unit>> removeItem(int itemId) async {
    try {
      await _dataSource.removeItem(itemId);
      return const Right(unit);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to remove item.'));
    }
  }

  @override
  Future<Either<Failure, Unit>> clearCart() async {
    try {
      await _dataSource.clearCart();
      return const Right(unit);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to clear cart.'));
    }
  }
}
