import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart' hide Order;
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/features/customer/order/domain/usecases/manage_order.dart';
import 'package:lightbite_app/features/customer/order/presentation/cubit/order_cubit.dart';
import 'package:lightbite_app/features/customer/order/presentation/cubit/order_state.dart';
import 'package:mocktail/mocktail.dart';

class MockManageOrders extends Mock implements ManageOrders {}

void main() {
  late MockManageOrders mockManageOrders;

  setUp(() {
    mockManageOrders = MockManageOrders();
  });

  group('OrderCubit', () {
    test('initial state is OrderInitial()', () {
      final cubit = OrderCubit(mockManageOrders);
      expect(cubit.state, const OrderInitial());
      cubit.close();
    });

    blocTest<OrderCubit, OrderState>(
      'loadOrders emits loading then loaded on success',
      build: () {
        when(() => mockManageOrders.getHistory())
            .thenAnswer((_) async => const Right([]));
        return OrderCubit(mockManageOrders);
      },
      act: (cubit) => cubit.loadOrders(),
      expect: () => [
        const OrderLoading(),
        const OrderLoaded(orders: [], activeOrder: null),
      ],
    );

    blocTest<OrderCubit, OrderState>(
      'loadOrders emits error on failure',
      build: () {
        when(() => mockManageOrders.getHistory())
            .thenAnswer((_) async => const Left(ServerFailure('Failed.')));
        return OrderCubit(mockManageOrders);
      },
      act: (cubit) => cubit.loadOrders(),
      expect: () => [
        const OrderLoading(),
        const OrderError('Failed.'),
      ],
    );

    blocTest<OrderCubit, OrderState>(
      'loadActiveOrder emits loaded with null when no active order',
      build: () {
        when(() => mockManageOrders.getActive())
            .thenAnswer((_) async => const Right(null));
        return OrderCubit(mockManageOrders);
      },
      seed: () => const OrderInitial(),
      act: (cubit) => cubit.loadActiveOrder(),
      expect: () => [const OrderLoaded(orders: [], activeOrder: null)],
    );
  });
}
