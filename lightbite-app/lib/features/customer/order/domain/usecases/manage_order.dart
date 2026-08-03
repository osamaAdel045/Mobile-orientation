import 'package:dartz/dartz.dart' hide Order;
import 'package:lightbite_app/core/errors/failures.dart';
import '../entities/order.dart';
import '../repositories/order_repository.dart';

class PlaceOrderParams {
  final String addressUuid;
  final String? note;
  const PlaceOrderParams({required this.addressUuid, this.note});
}

class ManageOrders {
  const ManageOrders(this._repository);
  final OrderRepository _repository;

  Future<Either<Failure, List<Order>>> getHistory() => _repository.getOrders();
  Future<Either<Failure, Order?>> getActive() => _repository.getActiveOrder();
  Future<Either<Failure, Order>> getDetail(String uuid) => _repository.getOrderDetail(uuid);
  Future<Either<Failure, Order>> place(PlaceOrderParams params) =>
      _repository.placeOrder(params.addressUuid, note: params.note);
}
