import 'package:dartz/dartz.dart' hide Order;
import 'package:lightbite_app/core/bloc/base_cubit.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/features/customer/order/domain/entities/order.dart';
import 'package:lightbite_app/features/customer/order/domain/usecases/manage_order.dart';
import 'order_state.dart';

class OrderCubit extends BaseCubit<OrderState> {
  OrderCubit(this._manageOrders) : super(const OrderInitial());

  final ManageOrders _manageOrders;

  Future<void> loadOrders() async {
    emit(const OrderLoading());
    final result = await _manageOrders.getHistory();
    result.fold(
      (failure) {
        print('OrderCubit.loadOrders failed');
        emit(OrderError(failure.message));
      },
      (orders) {
        print('OrderCubit.loadOrders success');
        final active = orders.where((o) => o.isActive).toList();
        emit(OrderLoaded(
          orders: orders,
          activeOrder: active.isNotEmpty ? active.first : null,
        ));
      },
    );
  }

  Future<void> loadActiveOrder() async {
    final result = await _manageOrders.getActive();
    result.fold(
      (_) {}, // No active order is common — silently stay in current state
      (active) => emit(OrderLoaded(orders: [], activeOrder: active)),
    );
  }

  /// Place a new order. Returns Right(order) or Left(failure).
  Future<Either<Failure, Order>> placeOrder(String addressUuid, {String? note}) {
    return _manageOrders.place(PlaceOrderParams(addressUuid: addressUuid, note: note));
  }
}
