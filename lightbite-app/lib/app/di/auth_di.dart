import 'package:lightbite_app/core/network/api_client.dart';
import 'package:lightbite_app/core/storage/secure_storage.dart';
import 'package:lightbite_app/features/auth/data/datasources/auth_local_datasource.dart';
import 'package:lightbite_app/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:lightbite_app/features/auth/data/datasources/auth_remote_datasource_impl.dart';
import 'package:lightbite_app/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:lightbite_app/features/auth/domain/repositories/auth_repository.dart';
import 'package:lightbite_app/features/auth/domain/usecases/login_user.dart';
import 'package:lightbite_app/features/auth/domain/usecases/register_user.dart';
import 'package:lightbite_app/features/auth/presentation/cubit/auth_cubit.dart';
import 'injection_container.dart';

void registerAuth() {
  sl.registerLazySingleton<AuthLocalDataSource>(() => AuthLocalDataSourceImpl(sl<SecureStorage>()));
  sl.registerLazySingleton<AuthRemoteDataSource>(() => AuthRemoteDataSourceImpl(sl<ApiClient>()));
  sl.registerLazySingleton<AuthRepository>(() => AuthRepositoryImpl(sl<AuthRemoteDataSource>(), sl<AuthLocalDataSource>()));
  sl.registerLazySingleton<LoginUser>(() => LoginUser(sl<AuthRepository>()));
  sl.registerLazySingleton<RegisterUser>(() => RegisterUser(sl<AuthRepository>()));
  sl.registerLazySingleton<AuthCubit>(() => AuthCubit(
        authRepo: sl<AuthRepository>(),
        loginUseCase: sl<LoginUser>(),
        registerUseCase: sl<RegisterUser>(),
      ));
}
