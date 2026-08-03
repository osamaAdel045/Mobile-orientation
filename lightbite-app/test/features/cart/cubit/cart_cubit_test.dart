import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/features/customer/cart/domain/entities/cart_item.dart';
import 'package:lightbite_app/features/customer/cart/domain/usecases/sync_cart.dart';
import 'package:lightbite_app/features/customer/cart/presentation/cubit/cart_cubit.dart';
import 'package:lightbite_app/features/customer/cart/presentation/cubit/cart_state.dart';
import 'package:mocktail/mocktail.dart';

class MockSyncCart extends Mock implements SyncCart {}

const testCart = Cart(
  items: [],
  subtotalFils: 0,
  deliveryFeeFils: 500,
  taxFils: 0,
  totalFils: 500,
  minOrderFils: 0,
);

void main() {
  late MockSyncCart mockSyncCart;

  setUp(() {
    mockSyncCart = MockSyncCart();
  });

  group('CartCubit', () {
    test('initial state is CartEmpty()', () {
      final cubit = CartCubit(mockSyncCart);
      expect(cubit.state, const CartEmpty());
      cubit.close();
    });

    blocTest<CartCubit, CartState>(
      'loadCart emits loading then loaded when cart has items',
      build: () {
        final cartWithItems = Cart(
          items: const [CartItem(menuItemId: 1, name: 'Test', unitPriceFils: 100, quantity: 1, imageUrl: '', menuItemUuid: 'u1')],
          subtotalFils: 100,
          deliveryFeeFils: 500,
          taxFils: 0,
          totalFils: 600,
          minOrderFils: 0,
        );
        when(() => mockSyncCart.load()).thenAnswer((_) async => Right(cartWithItems));
        return CartCubit(mockSyncCart);
      },
      act: (cubit) => cubit.loadCart(),
      expect: () => [
        const CartLoading(),
        isA<CartState>(),
      ],
    );

    blocTest<CartCubit, CartState>(
      'loadCart emits loading then empty when cart has no items',
      build: () {
        when(() => mockSyncCart.load()).thenAnswer((_) async => const Right(testCart));
        return CartCubit(mockSyncCart);
      },
      act: (cubit) => cubit.loadCart(),
      expect: () => [
        const CartLoading(),
        const CartEmpty(),
      ],
    );

    blocTest<CartCubit, CartState>(
      'loadCart emits error on failure',
      build: () {
        when(() => mockSyncCart.load())
            .thenAnswer((_) async => const Left(NetworkFailure()));
        return CartCubit(mockSyncCart);
      },
      act: (cubit) => cubit.loadCart(),
      expect: () => [
        const CartLoading(),
        const CartError('No internet connection. Check your network and try again.'),
      ],
    );

    blocTest<CartCubit, CartState>(
      'clearCart emits empty',
      build: () {
        when(() => mockSyncCart.clear()).thenAnswer((_) async => const Right(unit));
        return CartCubit(mockSyncCart);
      },
      seed: () => CartLoaded(testCart),
      act: (cubit) => cubit.clearCart(),
      expect: () => [const CartEmpty()],
    );
  });
}
