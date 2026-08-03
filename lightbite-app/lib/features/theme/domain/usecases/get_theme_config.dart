import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import '../entities/theme_config.dart';
import '../repositories/theme_repository.dart';

/// Use case for fetching the remote theme configuration.
class GetThemeConfig {
  GetThemeConfig(this._repository);

  final ThemeRepository _repository;

  Future<Either<Failure, ThemeConfig>> call() => _repository.getThemeConfig();
}
