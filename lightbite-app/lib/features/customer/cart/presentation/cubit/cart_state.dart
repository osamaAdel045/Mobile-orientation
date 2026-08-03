import 'package:equatable/equatable.dart';
import 'package:lightbite_app/features/customer/cart/domain/entities/cart_item.dart';

sealed class CartState extends Equatable {
  const CartState();
  R when<R>({required R Function() empty, required R Function() loading, required R Function(Cart cart) loaded, required R Function(String m) error}) =>
    switch (this) { CartEmpty() => empty(), CartLoading() => loading(), CartLoaded(:final cart) => loaded(cart), CartError(:final message) => error(message) };
  R maybeWhen<R>({R Function()? empty, R Function()? loading, R Function(Cart cart)? loaded, R Function(String m)? error, required R Function() orElse}) =>
    switch (this) { CartEmpty() => empty?.call() ?? orElse(), CartLoading() => loading?.call() ?? orElse(), CartLoaded(:final cart) => loaded?.call(cart) ?? orElse(), CartError(:final message) => error?.call(message) ?? orElse() };
}

class CartEmpty extends CartState { const CartEmpty(); @override List<Object?> get props => []; }
class CartLoading extends CartState { const CartLoading(); @override List<Object?> get props => []; }
class CartLoaded extends CartState { const CartLoaded(this.cart); final Cart cart; @override List<Object?> get props => [cart]; }
class CartError extends CartState { const CartError(this.message); final String message; @override List<Object?> get props => [message]; }
