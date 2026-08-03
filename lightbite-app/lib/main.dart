import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'app.dart';
import 'app/di/injection_container.dart';
import 'core/error_tracking/error_tracker.dart';
import 'core/storage/local_cache.dart';
import 'core/theme/app_colors.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await dotenv.load(fileName: '.env');

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: AppColors.neutral0,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  await LocalCache.init();

  // HydratedBloc persists Cubit state across app restarts
  HydratedBloc.storage = await HydratedStorage.build(
    storageDirectory: HydratedStorageDirectory(
      await getApplicationDocumentsDirectory().then((d) => d.path),
    ),
  );

  await initDependencies();

  // ── Global error handling ──
  final errorTracker = sl<ErrorTracker>();

  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    errorTracker.captureException(
      details.exception,
      details.stack,
      hint: 'Flutter error: ${details.summary}',
    );
  };

  PlatformDispatcher.instance.onError = (error, stack) {
    errorTracker.captureException(error, stack, hint: 'Platform error');
    return true;
  };

  // Sentry wraps the app for crash reporting. Falls back gracefully
  // if the DSN is not configured (local development).
  final dsn = dotenv.env['SENTRY_DSN'];
  if (dsn != null && dsn.isNotEmpty) {
    await SentryFlutter.init(
      (options) {
        options.dsn = dsn;
        options.tracesSampleRate = 1.0;
        options.environment = dotenv.env['ENV'];
      },
      appRunner: () => runZonedGuarded(
        () => runApp(const LightBiteApp()),
        (error, stack) =>
            errorTracker.captureException(error, stack, hint: 'Unhandled async error'),
      ),
    );
  } else {
    runZonedGuarded(
      () => runApp(const LightBiteApp()),
      (error, stack) =>
          errorTracker.captureException(error, stack, hint: 'Unhandled async error'),
    );
  }
}
