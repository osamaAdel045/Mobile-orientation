import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/features/customer/order/data/datasources/order_remote_datasource.dart';
import 'package:lightbite_app/features/customer/order/data/models/order_model.dart';
import 'package:lightbite_app/features/customer/order/data/repositories/order_repository_impl.dart';
import 'package:lightbite_app/features/customer/order/domain/repositories/order_repository.dart';
import 'package:mocktail/mocktail.dart';

class MockOrderRemoteDataSource extends Mock implements OrderRemoteDataSource {}

const testOrderModel = OrderModel(
  uuid: 'order-1',
  orderNumber: 'ORD-001',
  status: 'pending',
  restaurantName: 'Test',
  driverName: null,
  items: [],
  createdAt: '2026-01-01T00:00:00Z',
);

void main() {
  late MockOrderRemoteDataSource mockDataSource;
  late OrderRepository repo;

  setUp(() {
    mockDataSource = MockOrderRemoteDataSource();
    repo = OrderRepositoryImpl(mockDataSource);
    registerFallbackValue(testOrderModel);
  });

  group('OrderRepositoryImpl', () {
    test('getOrders returns Right with mapped orders', () async {
      when(() => mockDataSource.getOrders()).thenAnswer((_) async => [testOrderModel]);
      final result = await repo.getOrders();
      expect(result.isRight(), true);
      result.fold((_) => fail('Expected Right'), (orders) => expect(orders.length, 1));
    });

    test('getActiveOrder returns Right with first active order', () async {
      when(() => mockDataSource.getActiveOrders()).thenAnswer((_) async => [testOrderModel]);
      final result = await repo.getActiveOrder();
      expect(result.isRight(), true);
    });

    test('placeOrder returns Right', () async {
      when(() => mockDataSource.placeOrder(any(), note: any(named: 'note')))
          .thenAnswer((_) async => testOrderModel);
      final result = await repo.placeOrder('addr-uuid');
      expect(result.isRight(), true);
    });
  });
}
