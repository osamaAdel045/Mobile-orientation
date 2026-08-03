import 'package:lightbite_app/core/bloc/base_cubit.dart';
import 'package:lightbite_app/features/customer/cart/domain/usecases/sync_cart.dart';
import 'cart_state.dart';

class CartCubit extends BaseCubit<CartState> {
  CartCubit(this._syncCart) : super(const CartEmpty());

  final SyncCart _syncCart;

  Future<void> loadCart() async {
    emit(const CartLoading());
    final result = await _syncCart.load();
    result.fold(
      (failure) => emit(CartError(failure.message)),
      (cart) => cart.items.isEmpty
          ? emit(const CartEmpty())
          : emit(CartLoaded(cart)),
    );
  }

  Future<void> addItem(String menuItemUuid, int quantity, {String? instructions}) async {
    final result = await _syncCart.addItem(AddToCartParams(
      menuItemUuid: menuItemUuid, quantity: quantity, instructions: instructions,
    ));
    result.fold(
      (failure) => emit(CartError(failure.message)),
      (cart) => emit(CartLoaded(cart)),
    );
  }

  Future<void> updateQuantity(int itemId, int quantity) async {
    if (quantity <= 0) {
      final result = await _syncCart.removeItem(itemId);
      result.fold(
        (failure) => emit(CartError(failure.message)),
        (_) => loadCart(),
      );
    } else {
      final result = await _syncCart.updateItem(itemId, quantity);
      result.fold(
        (failure) => emit(CartError(failure.message)),
        (_) => loadCart(),
      );
    }
  }

  Future<void> removeItem(int itemId) async {
    final result = await _syncCart.removeItem(itemId);
    result.fold(
      (failure) => emit(CartError(failure.message)),
      (_) => loadCart(),
    );
  }

  Future<void> clearCart() async {
    final result = await _syncCart.clear();
    result.fold(
      (_) {},
      (_) => emit(const CartEmpty()),
    );
  }
}
