import 'package:lightbite_app/core/network/api_client.dart';
import 'package:lightbite_app/features/customer/restaurant/data/datasources/restaurant_remote_datasource.dart';
import 'package:lightbite_app/features/customer/restaurant/data/repositories/restaurant_repository_impl.dart';
import 'package:lightbite_app/features/customer/restaurant/domain/repositories/restaurant_repository.dart';
import 'package:lightbite_app/features/customer/restaurant/presentation/cubit/menu_cubit.dart';
import 'injection_container.dart';

void registerRestaurant() {
  sl.registerLazySingleton<RestaurantRemoteDataSource>(() => RestaurantRemoteDataSourceImpl(sl<ApiClient>()));
  sl.registerLazySingleton<RestaurantRepository>(() => RestaurantRepositoryImpl(sl<RestaurantRemoteDataSource>()));
  sl.registerFactory<MenuCubit>(() => MenuCubit(sl<RestaurantRepository>()));
}
