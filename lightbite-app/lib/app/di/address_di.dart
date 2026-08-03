import 'package:lightbite_app/core/network/api_client.dart';
import 'package:lightbite_app/features/customer/address/data/datasources/address_remote_datasource.dart';
import 'package:lightbite_app/features/customer/address/data/repositories/address_repository_impl.dart';
import 'package:lightbite_app/features/customer/address/domain/repositories/address_repository.dart';
import 'package:lightbite_app/features/customer/address/domain/usecases/manage_addresses.dart';
import 'package:lightbite_app/features/customer/address/presentation/cubit/address_cubit.dart';
import 'injection_container.dart';

void registerAddress() {
  sl.registerLazySingleton<AddressRemoteDataSource>(() => AddressRemoteDataSourceImpl(sl<ApiClient>()));
  sl.registerLazySingleton<AddressRepository>(() => AddressRepositoryImpl(sl<AddressRemoteDataSource>()));
  sl.registerLazySingleton<ManageAddresses>(() => ManageAddresses(sl<AddressRepository>()));
  sl.registerFactory<AddressCubit>(() => AddressCubit(sl<ManageAddresses>()));
}
