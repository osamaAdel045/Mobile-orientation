import '../../../../../core/network/api_client.dart';
import '../models/menu_models.dart';

abstract class RestaurantRemoteDataSource {
  Future<MenuResponse> getMenu(String restaurantUuid);
}

class RestaurantRemoteDataSourceImpl implements RestaurantRemoteDataSource {
  const RestaurantRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<MenuResponse> getMenu(String restaurantUuid) async {
    final response = await _client.get('/restaurants/$restaurantUuid/menu');
    final data = response.data['data'] as Map<String, dynamic>;
    return MenuResponse.fromJson(data);
  }
}
