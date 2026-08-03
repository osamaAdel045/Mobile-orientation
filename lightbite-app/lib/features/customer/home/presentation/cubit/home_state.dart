import 'package:equatable/equatable.dart';
import 'package:lightbite_app/features/customer/home/domain/entities/restaurant.dart';

sealed class HomeState extends Equatable {
  const HomeState();
  R when<R>({required R Function() initial, required R Function() loading, required R Function(List<Restaurant> r, List<Restaurant> a, List<String> c, String? s) loaded, required R Function(String m) error}) =>
    switch (this) { HomeInitial() => initial(), HomeLoading() => loading(), HomeLoaded(:final restaurants, :final allRestaurants, :final cuisines, :final selectedCuisine) => loaded(restaurants, allRestaurants, cuisines, selectedCuisine), HomeError(:final message) => error(message) };
  R maybeWhen<R>({R Function()? initial, R Function()? loading, R Function(List<Restaurant> r, List<Restaurant> a, List<String> c, String? s)? loaded, R Function(String m)? error, required R Function() orElse}) =>
    switch (this) { HomeInitial() => initial?.call() ?? orElse(), HomeLoading() => loading?.call() ?? orElse(), HomeLoaded(:final restaurants, :final allRestaurants, :final cuisines, :final selectedCuisine) => loaded?.call(restaurants, allRestaurants, cuisines, selectedCuisine) ?? orElse(), HomeError(:final message) => error?.call(message) ?? orElse() };
}
class HomeInitial extends HomeState { const HomeInitial(); @override List<Object?> get props => []; }
class HomeLoading extends HomeState { const HomeLoading(); @override List<Object?> get props => []; }
class HomeError extends HomeState { const HomeError(this.message); final String message; @override List<Object?> get props => [message]; }
class HomeLoaded extends HomeState {
  const HomeLoaded({required this.restaurants, required this.allRestaurants, required this.cuisines, this.selectedCuisine});
  final List<Restaurant> restaurants; final List<Restaurant> allRestaurants; final List<String> cuisines; final String? selectedCuisine;
  @override List<Object?> get props => [restaurants, allRestaurants, cuisines, selectedCuisine];
  HomeLoaded copyWith({List<Restaurant>? restaurants, List<Restaurant>? allRestaurants, List<String>? cuisines, String? selectedCuisine}) =>
      HomeLoaded(restaurants: restaurants ?? this.restaurants, allRestaurants: allRestaurants ?? this.allRestaurants, cuisines: cuisines ?? this.cuisines, selectedCuisine: selectedCuisine ?? this.selectedCuisine);
}
