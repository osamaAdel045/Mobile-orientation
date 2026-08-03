import '../../domain/entities/restaurant_menu.dart';
import '../../domain/repositories/restaurant_repository.dart';
import '../datasources/restaurant_remote_datasource.dart';

class RestaurantRepositoryImpl implements RestaurantRepository {
  const RestaurantRepositoryImpl(this._remoteDataSource);

  final RestaurantRemoteDataSource _remoteDataSource;

  @override
  Future<RestaurantMenu> getMenu(String restaurantUuid) async {
    final response = await _remoteDataSource.getMenu(restaurantUuid);
    return response.toEntity();
  }
}
