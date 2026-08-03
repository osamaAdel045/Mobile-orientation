import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import '../entities/cart_item.dart';
import '../repositories/cart_repository.dart';

class AddToCartParams {
  final String menuItemUuid;
  final int quantity;
  final String? instructions;
  const AddToCartParams({required this.menuItemUuid, this.quantity = 1, this.instructions});
}

class SyncCart {
  const SyncCart(this._repository);
  final CartRepository _repository;

  Future<Either<Failure, Cart>> load() => _repository.getCart();
  Future<Either<Failure, Cart>> addItem(AddToCartParams params) =>
      _repository.addItem(params.menuItemUuid, params.quantity, params.instructions);
  Future<Either<Failure, Cart>> updateItem(int itemId, int quantity) =>
      _repository.updateItem(itemId, quantity);
  Future<Either<Failure, Unit>> removeItem(int itemId) => _repository.removeItem(itemId);
  Future<Either<Failure, Unit>> clear() => _repository.clearCart();
}
