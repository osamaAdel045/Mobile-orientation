import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import '../entities/cart_item.dart';

abstract class CartRepository {
  Future<Either<Failure, Cart>> getCart();
  Future<Either<Failure, Cart>> addItem(String menuItemUuid, int quantity, String? instructions);
  Future<Either<Failure, Cart>> updateItem(int itemId, int quantity);
  Future<Either<Failure, Unit>> removeItem(int itemId);
  Future<Either<Failure, Unit>> clearCart();
}
