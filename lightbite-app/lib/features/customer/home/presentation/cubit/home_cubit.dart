import 'package:lightbite_app/core/bloc/base_cubit.dart';
import '../../../home/domain/usecases/get_nearby_restaurants.dart';
import '../../../home/domain/usecases/search_restaurants.dart';
import 'home_state.dart';

class HomeCubit extends BaseCubit<HomeState> {
  HomeCubit(this._getNearby, this._search) : super(const HomeInitial());

  final GetNearbyRestaurants _getNearby;
  final SearchRestaurants _search;

  Future<void> loadRestaurants(double lat, double lng) async {
    emit(const HomeLoading());
    final result = await _getNearby(lat, lng);
    result.fold(
      (failure) => emit(HomeError(failure.message)),
      (restaurants) {
        final cuisines = restaurants
            .expand((r) => r.cuisineTypes)
            .toSet()
            .toList()
          ..sort();
        emit(HomeLoaded(
          restaurants: restaurants,
          allRestaurants: restaurants,
          cuisines: ['All', ...cuisines],
        ));
      },
    );
  }

  Future<void> search(String query) async {
    emit(const HomeLoading());
    final result = await _search(query);
    result.fold(
      (failure) => emit(HomeError(failure.message)),
      (results) => emit(HomeLoaded(
        restaurants: results,
        allRestaurants: results,
        cuisines: ['All'],
        selectedCuisine: 'All',
      )),
    );
  }

  void filterByCuisine(String cuisine) {
    state.maybeWhen(
      loaded: (restaurants, allRestaurants, cuisines, selected) {
        final source =
            allRestaurants.isNotEmpty ? allRestaurants : restaurants;
        if (cuisine == 'All') {
          emit(HomeLoaded(
            restaurants: source,
            allRestaurants: source,
            cuisines: cuisines,
            selectedCuisine: 'All',
          ));
        } else {
          final filtered =
              source.where((r) => r.cuisineTypes.contains(cuisine)).toList();
          emit(HomeLoaded(
            restaurants: filtered,
            allRestaurants: source,
            cuisines: cuisines,
            selectedCuisine: cuisine,
          ));
        }
      },
      orElse: () {},
    );
  }
}
