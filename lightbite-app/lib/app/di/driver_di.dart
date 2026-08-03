import 'package:lightbite_app/core/network/api_client.dart';
import 'package:lightbite_app/features/driver/home/data/datasources/driver_remote_datasource.dart';
import 'package:lightbite_app/features/driver/home/data/repositories/driver_repository_impl.dart';
import 'package:lightbite_app/features/driver/home/domain/repositories/driver_repository.dart';
import 'package:lightbite_app/features/driver/home/domain/usecases/manage_delivery.dart';
import 'package:lightbite_app/features/driver/home/presentation/cubit/driver_cubit.dart';
import 'package:lightbite_app/features/driver/earnings/presentation/cubit/earnings_cubit.dart';
import 'package:lightbite_app/features/driver/history/presentation/cubit/history_cubit.dart';
import 'injection_container.dart';

void registerDriver() {
  sl.registerLazySingleton<DriverRemoteDataSource>(() => DriverRemoteDataSourceImpl(sl<ApiClient>()));
  sl.registerLazySingleton<DriverRepository>(() => DriverRepositoryImpl(sl<DriverRemoteDataSource>()));
  sl.registerLazySingleton<ManageDelivery>(() => ManageDelivery(sl<DriverRepository>()));
  sl.registerFactory<DriverCubit>(() => DriverCubit(sl<ManageDelivery>()));
  sl.registerFactory<EarningsCubit>(() => EarningsCubit(sl<ManageDelivery>()));
  sl.registerFactory<HistoryCubit>(() => HistoryCubit(sl<ManageDelivery>()));
}
