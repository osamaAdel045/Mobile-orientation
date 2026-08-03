import 'package:lightbite_app/core/network/api_client.dart';
import 'package:lightbite_app/features/customer/order/data/datasources/order_remote_datasource.dart';
import 'package:lightbite_app/features/customer/order/data/repositories/order_repository_impl.dart';
import 'package:lightbite_app/features/customer/order/domain/repositories/order_repository.dart';
import 'package:lightbite_app/features/customer/order/domain/usecases/manage_order.dart';
import 'package:lightbite_app/features/customer/order/presentation/cubit/order_cubit.dart';
import 'injection_container.dart';

void registerOrder() {
  sl.registerLazySingleton<OrderRemoteDataSource>(() => OrderRemoteDataSourceImpl(sl<ApiClient>()));
  sl.registerLazySingleton<OrderRepository>(() => OrderRepositoryImpl(sl<OrderRemoteDataSource>()));
  sl.registerLazySingleton<ManageOrders>(() => ManageOrders(sl<OrderRepository>()));
  sl.registerLazySingleton<OrderCubit>(() => OrderCubit(sl<ManageOrders>()));
}
