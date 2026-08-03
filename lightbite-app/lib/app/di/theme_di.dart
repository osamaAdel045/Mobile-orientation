import 'package:lightbite_app/features/theme/data/datasources/theme_remote_datasource.dart';
import 'package:lightbite_app/features/theme/data/datasources/theme_remote_datasource_impl.dart';
import 'package:lightbite_app/features/theme/data/repositories/theme_repository_impl.dart';
import 'package:lightbite_app/features/theme/domain/repositories/theme_repository.dart';
import 'package:lightbite_app/features/theme/domain/usecases/get_theme_config.dart';
import 'package:lightbite_app/features/theme/presentation/cubit/theme_cubit.dart';
import 'injection_container.dart';

void registerTheme() {
  // Data source
  sl.registerLazySingleton<ThemeRemoteDataSource>(
    () => ThemeRemoteDataSourceImpl(sl()),
  );

  // Repository
  sl.registerLazySingleton<ThemeRepository>(
    () => ThemeRepositoryImpl(sl()),
  );

  // Use case
  sl.registerLazySingleton<GetThemeConfig>(
    () => GetThemeConfig(sl()),
  );

  // Cubit (lazy singleton since it's app-wide)
  sl.registerLazySingleton<ThemeCubit>(
    () => ThemeCubit(sl()),
  );
}
