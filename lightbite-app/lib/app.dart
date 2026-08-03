import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'app/di/injection_container.dart';
import 'app/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/websocket/ws_client.dart';
import 'features/auth/presentation/cubit/auth_cubit.dart';
import 'features/theme/presentation/cubit/theme_cubit.dart';
import 'features/theme/presentation/cubit/theme_state.dart';
import 'l10n/app_localizations.dart';

class LightBiteApp extends StatefulWidget {
  const LightBiteApp({super.key});

  @override
  State<LightBiteApp> createState() => _LightBiteAppState();
}

class _LightBiteAppState extends State<LightBiteApp>
    with WidgetsBindingObserver {
  late final AuthCubit _authCubit;
  late final ThemeCubit _themeCubit;
  late final WsClient _wsClient;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _authCubit = sl<AuthCubit>();
    _themeCubit = sl<ThemeCubit>();
    _wsClient = sl<WsClient>();
    _authCubit.checkAuth();
    _themeCubit.loadThemeConfig();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _authCubit.close();
    _themeCubit.close();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.paused:
      case AppLifecycleState.inactive:
        _wsClient.pause();
      case AppLifecycleState.resumed:
        _wsClient.resume();
      case AppLifecycleState.hidden:
      case AppLifecycleState.detached:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider.value(value: _authCubit),
        BlocProvider.value(value: _themeCubit),
      ],
      child: BlocBuilder<ThemeCubit, ThemeState>(
        builder: (context, ThemeState themeState) {
          print('_LightBiteAppState.build ${themeState.config?.colors}');
          return MaterialApp.router(
            title: 'LightBite',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(themeState.config),
            darkTheme: AppTheme.dark(themeState.config),
            themeMode: themeState.mode,
            routerConfig: createRouter(),
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: AppLocalizations.supportedLocales,
          );
        },
      ),
    );
  }
}
