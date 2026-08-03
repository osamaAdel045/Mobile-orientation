import 'package:dartz/dartz.dart' hide Order;
import 'package:lightbite_app/core/errors/failures.dart';
import '../entities/order.dart';

abstract class OrderRepository {
  Future<Either<Failure, List<Order>>> getOrders();
  Future<Either<Failure, Order?>> getActiveOrder();
  Future<Either<Failure, Order>> getOrderDetail(String uuid);
  Future<Either<Failure, Order>> placeOrder(String addressUuid, {String? note});
}
