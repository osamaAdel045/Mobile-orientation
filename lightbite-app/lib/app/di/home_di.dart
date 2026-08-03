import 'package:lightbite_app/core/network/api_client.dart';
import 'package:lightbite_app/features/customer/home/data/datasources/home_remote_datasource.dart';
import 'package:lightbite_app/features/customer/home/data/repositories/home_repository_impl.dart';
import 'package:lightbite_app/features/customer/home/domain/repositories/home_repository.dart';
import 'package:lightbite_app/features/customer/home/domain/usecases/get_nearby_restaurants.dart';
import 'package:lightbite_app/features/customer/home/domain/usecases/search_restaurants.dart';
import 'package:lightbite_app/features/customer/home/presentation/cubit/home_cubit.dart';
import 'injection_container.dart';

void registerHome() {
  sl.registerLazySingleton<HomeRemoteDataSource>(() => HomeRemoteDataSourceImpl(sl<ApiClient>()));
  sl.registerLazySingleton<HomeRepository>(() => HomeRepositoryImpl(sl<HomeRemoteDataSource>()));
  sl.registerLazySingleton<GetNearbyRestaurants>(() => GetNearbyRestaurants(sl<HomeRepository>()));
  sl.registerLazySingleton<SearchRestaurants>(() => SearchRestaurants(sl<HomeRepository>()));
  sl.registerFactory<HomeCubit>(() => HomeCubit(sl<GetNearbyRestaurants>(), sl<SearchRestaurants>()));
}
