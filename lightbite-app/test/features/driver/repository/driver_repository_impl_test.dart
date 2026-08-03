import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/features/driver/home/data/datasources/driver_remote_datasource.dart';
import 'package:lightbite_app/features/driver/home/data/repositories/driver_repository_impl.dart';
import 'package:lightbite_app/features/driver/home/domain/repositories/driver_repository.dart';
import 'package:mocktail/mocktail.dart';

class MockDriverRemoteDataSource extends Mock implements DriverRemoteDataSource {}

void main() {
  late MockDriverRemoteDataSource mockDataSource;
  late DriverRepository repo;

  setUp(() {
    mockDataSource = MockDriverRemoteDataSource();
    repo = DriverRepositoryImpl(mockDataSource);
  });

  group('DriverRepositoryImpl', () {
    test('toggleOnline returns Right(unit)', () async {
      when(() => mockDataSource.toggleOnline(true)).thenAnswer((_) async {});
      final result = await repo.toggleOnline(true);
      expect(result.isRight(), true);
    });

    test('pollForJob returns Right(null) when no pending jobs', () async {
      when(() => mockDataSource.getDriverHome())
          .thenAnswer((_) async => {'pending_jobs': <dynamic>[]});
      final result = await repo.pollForJob();
      expect(result.isRight(), true);
      result.fold((_) => fail('Expected Right'), (job) => expect(job, isNull));
    });

    test('acceptJob returns Right(unit)', () async {
      when(() => mockDataSource.acceptJob(any())).thenAnswer((_) async {});
      final result = await repo.acceptJob('order-1');
      expect(result.isRight(), true);
    });
  });
}
