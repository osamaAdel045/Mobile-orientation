import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/features/customer/cart/data/datasources/cart_remote_datasource.dart';
import 'package:lightbite_app/features/customer/cart/data/models/cart_model.dart';
import 'package:lightbite_app/features/customer/cart/data/repositories/cart_repository_impl.dart';
import 'package:lightbite_app/features/customer/cart/domain/repositories/cart_repository.dart';
import 'package:mocktail/mocktail.dart';

class MockCartRemoteDataSource extends Mock implements CartRemoteDataSource {}

const testCartModel = CartDataModel(
  items: [],
  subtotal: '0',
);

void main() {
  late MockCartRemoteDataSource mockDataSource;
  late CartRepository repo;

  setUp(() {
    mockDataSource = MockCartRemoteDataSource();
    repo = CartRepositoryImpl(mockDataSource);
  });

  group('CartRepositoryImpl', () {
    test('getCart returns Right', () async {
      when(() => mockDataSource.getCart()).thenAnswer((_) async => testCartModel);
      final result = await repo.getCart();
      expect(result.isRight(), true);
    });

    test('addItem returns Right', () async {
      when(() => mockDataSource.addItem(any(), any(), any()))
          .thenAnswer((_) async => testCartModel);
      final result = await repo.addItem('uuid', 1, null);
      expect(result.isRight(), true);
    });

    test('removeItem returns Right(unit)', () async {
      when(() => mockDataSource.removeItem(any())).thenAnswer((_) async {});
      final result = await repo.removeItem(1);
      expect(result.isRight(), true);
    });

    test('clearCart returns Right(unit)', () async {
      when(() => mockDataSource.clearCart()).thenAnswer((_) async {});
      final result = await repo.clearCart();
      expect(result.isRight(), true);
    });
  });
}
