import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/features/customer/home/domain/usecases/get_nearby_restaurants.dart';
import 'package:lightbite_app/features/customer/home/domain/usecases/search_restaurants.dart';
import 'package:lightbite_app/features/customer/home/presentation/cubit/home_cubit.dart';
import 'package:lightbite_app/features/customer/home/presentation/cubit/home_state.dart';
import 'package:mocktail/mocktail.dart';

class MockGetNearbyRestaurants extends Mock implements GetNearbyRestaurants {}
class MockSearchRestaurants extends Mock implements SearchRestaurants {}

void main() {
  late MockGetNearbyRestaurants mockGetNearby;
  late MockSearchRestaurants mockSearch;

  setUp(() {
    mockGetNearby = MockGetNearbyRestaurants();
    mockSearch = MockSearchRestaurants();
  });

  group('HomeCubit', () {
    test('initial state is HomeInitial()', () {
      final cubit = HomeCubit(mockGetNearby, mockSearch);
      expect(cubit.state, const HomeInitial());
      cubit.close();
    });

    blocTest<HomeCubit, HomeState>(
      'loadRestaurants emits loading then loaded on success',
      build: () {
        when(() => mockGetNearby(any(), any()))
            .thenAnswer((_) async => const Right([]));
        return HomeCubit(mockGetNearby, mockSearch);
      },
      act: (cubit) => cubit.loadRestaurants(25.0, 55.0),
      expect: () => [
        const HomeLoading(),
        const HomeLoaded(restaurants: [], allRestaurants: [], cuisines: ['All']),
      ],
    );

    blocTest<HomeCubit, HomeState>(
      'loadRestaurants emits loading then error on failure',
      build: () {
        when(() => mockGetNearby(any(), any()))
            .thenAnswer((_) async => const Left(ServerFailure('Failed.')));
        return HomeCubit(mockGetNearby, mockSearch);
      },
      act: (cubit) => cubit.loadRestaurants(25.0, 55.0),
      expect: () => [
        const HomeLoading(),
        const HomeError('Failed.'),
      ],
    );

    blocTest<HomeCubit, HomeState>(
      'filterByCuisine emits loaded with filtered restaurants',
      build: () => HomeCubit(mockGetNearby, mockSearch),
      seed: () => const HomeLoaded(restaurants: [], allRestaurants: [], cuisines: ['All', 'Italian']),
      act: (cubit) => cubit.filterByCuisine('Italian'),
      expect: () => [
        const HomeLoaded(restaurants: [], allRestaurants: [], cuisines: ['All', 'Italian'], selectedCuisine: 'Italian'),
      ],
    );
  });
}
