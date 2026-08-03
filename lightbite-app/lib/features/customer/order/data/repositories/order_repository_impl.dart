import 'package:dartz/dartz.dart' hide Order;
import 'package:dio/dio.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/core/errors/failure_mapper.dart';
import 'package:lightbite_app/features/customer/order/domain/entities/order.dart';
import 'package:lightbite_app/features/customer/order/domain/repositories/order_repository.dart';
import '../datasources/order_remote_datasource.dart';

class OrderRepositoryImpl implements OrderRepository {
  OrderRepositoryImpl(this._dataSource);
  final OrderRemoteDataSource _dataSource;

  @override
  Future<Either<Failure, List<Order>>> getOrders() async {
    try {
      final models = await _dataSource.getOrders();
      return Right(models.map((m) => m.toEntity()).toList());
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e,s) {
      return const Left(ServerFailure('Failed to load orders.'));
    }
  }

  @override
  Future<Either<Failure, Order?>> getActiveOrder() async {
    try {
      final models = await _dataSource.getActiveOrders();
      return Right(models.isNotEmpty ? models.first.toEntity() : null);
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to load active order.'));
    }
  }

  @override
  Future<Either<Failure, Order>> getOrderDetail(String uuid) async {
    try {
      final model = await _dataSource.getOrderDetail(uuid);
      return Right(model.toEntity());
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to load order details.'));
    }
  }

  @override
  Future<Either<Failure, Order>> placeOrder(String addressUuid, {String? note}) async {
    try {
      final model = await _dataSource.placeOrder(addressUuid, note: note);
      return Right(model.toEntity());
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure('Failed to place order.'));
    }
  }
}
