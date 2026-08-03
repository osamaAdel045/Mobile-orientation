import 'package:lightbite_app/core/network/api_client.dart';
import 'package:lightbite_app/features/customer/cart/data/datasources/cart_remote_datasource.dart';
import 'package:lightbite_app/features/customer/cart/data/repositories/cart_repository_impl.dart';
import 'package:lightbite_app/features/customer/cart/domain/repositories/cart_repository.dart';
import 'package:lightbite_app/features/customer/cart/domain/usecases/sync_cart.dart';
import 'package:lightbite_app/features/customer/cart/presentation/cubit/cart_cubit.dart';
import 'injection_container.dart';

void registerCart() {
  sl.registerLazySingleton<CartRemoteDataSource>(() => CartRemoteDataSourceImpl(sl<ApiClient>()));
  sl.registerLazySingleton<CartRepository>(() => CartRepositoryImpl(sl<CartRemoteDataSource>()));
  sl.registerLazySingleton<SyncCart>(() => SyncCart(sl<CartRepository>()));
  sl.registerLazySingleton<CartCubit>(() => CartCubit(sl<SyncCart>()));
}
