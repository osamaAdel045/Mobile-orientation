import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/features/driver/home/domain/usecases/manage_delivery.dart';
import 'package:lightbite_app/features/driver/home/presentation/cubit/driver_cubit.dart';
import 'package:lightbite_app/features/driver/home/presentation/cubit/driver_state.dart';
import 'package:mocktail/mocktail.dart';

class MockManageDelivery extends Mock implements ManageDelivery {}

void main() {
  late MockManageDelivery mockManageDelivery;

  setUp(() {
    mockManageDelivery = MockManageDelivery();
  });

  group('DriverCubit', () {
    test('initial state is DriverOffline()', () {
      final cubit = DriverCubit(mockManageDelivery);
      expect(cubit.state, const DriverOffline());
      cubit.close();
    });

    blocTest<DriverCubit, DriverState>(
      'toggleOnline goes online when offline',
      build: () {
        when(() => mockManageDelivery.toggleOnline(true))
            .thenAnswer((_) async => const Right(unit));
        when(() => mockManageDelivery.pollForJob())
            .thenAnswer((_) async => const Right(null));
        return DriverCubit(mockManageDelivery);
      },
      act: (cubit) => cubit.toggleOnline(),
      expect: () => [const DriverWaiting()],
    );

    blocTest<DriverCubit, DriverState>(
      'toggleOnline goes offline when online',
      build: () {
        when(() => mockManageDelivery.toggleOnline(false))
            .thenAnswer((_) async => const Right(unit));
        return DriverCubit(mockManageDelivery);
      },
      seed: () => const DriverWaiting(),
      act: (cubit) => cubit.toggleOnline(),
      expect: () => [const DriverOffline()],
    );

    blocTest<DriverCubit, DriverState>(
      'toggleOnline emits error on failure',
      build: () {
        when(() => mockManageDelivery.toggleOnline(true))
            .thenAnswer((_) async => const Left(NetworkFailure()));
        return DriverCubit(mockManageDelivery);
      },
      act: (cubit) => cubit.toggleOnline(),
      expect: () => [const DriverError('No internet connection. Check your network and try again.')],
    );
  });
}
