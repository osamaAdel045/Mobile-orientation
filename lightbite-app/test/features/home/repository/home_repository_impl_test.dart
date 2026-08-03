import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/features/customer/home/data/datasources/home_remote_datasource.dart';
import 'package:lightbite_app/features/customer/home/data/repositories/home_repository_impl.dart';
import 'package:lightbite_app/features/customer/home/domain/repositories/home_repository.dart';
import 'package:mocktail/mocktail.dart';

class MockHomeRemoteDataSource extends Mock implements HomeRemoteDataSource {}

void main() {
  late MockHomeRemoteDataSource mockDataSource;
  late HomeRepository repo;

  setUp(() {
    mockDataSource = MockHomeRemoteDataSource();
    repo = HomeRepositoryImpl(mockDataSource);
  });

  group('HomeRepositoryImpl', () {
    test('getNearbyRestaurants returns Right with mapped restaurants', () async {
      when(() => mockDataSource.getNearbyRestaurants(any(), any()))
          .thenAnswer((_) async => []);
      final result = await repo.getNearbyRestaurants(25.0, 55.0);
      expect(result.isRight(), true);
    });

    test('searchRestaurants returns Right with mapped restaurants', () async {
      when(() => mockDataSource.searchRestaurants(any(), cuisine: any(named: 'cuisine')))
          .thenAnswer((_) async => []);
      final result = await repo.searchRestaurants('test');
      expect(result.isRight(), true);
    });
  });
}
