import 'package:equatable/equatable.dart';
import 'package:lightbite_app/features/customer/order/domain/entities/order.dart';

sealed class OrderState extends Equatable {
  const OrderState();
  R when<R>({required R Function() initial, required R Function() loading, required R Function(List<Order> orders, Order? active) loaded, required R Function(String m) error}) =>
    switch (this) { OrderInitial() => initial(), OrderLoading() => loading(), OrderLoaded(:final orders, :final activeOrder) => loaded(orders, activeOrder), OrderError(:final message) => error(message) };
  R maybeWhen<R>({R Function()? initial, R Function()? loading, R Function(List<Order> orders, Order? active)? loaded, R Function(String m)? error, required R Function() orElse}) =>
    switch (this) { OrderInitial() => initial?.call() ?? orElse(), OrderLoading() => loading?.call() ?? orElse(), OrderLoaded(:final orders, :final activeOrder) => loaded?.call(orders, activeOrder) ?? orElse(), OrderError(:final message) => error?.call(message) ?? orElse() };
}
class OrderInitial extends OrderState { const OrderInitial(); @override List<Object?> get props => []; }
class OrderLoading extends OrderState { const OrderLoading(); @override List<Object?> get props => []; }
class OrderError extends OrderState { const OrderError(this.message); final String message; @override List<Object?> get props => [message]; }
class OrderLoaded extends OrderState { const OrderLoaded({required this.orders, this.activeOrder}); final List<Order> orders; final Order? activeOrder; @override List<Object?> get props => [orders, activeOrder]; }
