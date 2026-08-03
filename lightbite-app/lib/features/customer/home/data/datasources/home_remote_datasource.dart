import 'package:lightbite_app/core/network/api_client.dart';
import '../models/restaurant_model.dart';

abstract class HomeRemoteDataSource {
  Future<List<RestaurantModel>> getNearbyRestaurants(double lat, double lng);
  Future<List<RestaurantModel>> searchRestaurants(String query, {String? cuisine});
}

class HomeRemoteDataSourceImpl implements HomeRemoteDataSource {
  HomeRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<List<RestaurantModel>> getNearbyRestaurants(double lat, double lng) async {
    final response = await _client.get('/restaurants', queryParameters: {
      'lat': lat.toString(),
      'lng': lng.toString(),
    });

    final List<dynamic> data = response.data['data'] ?? [];
    return data.map((json) => RestaurantModel.fromJson(json as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<RestaurantModel>> searchRestaurants(String query, {String? cuisine}) async {
    final params = <String, String>{'search': query};
    if (cuisine != null) params['cuisine'] = cuisine;

    final response = await _client.get('/restaurants', queryParameters: params);

    final List<dynamic> data = response.data['data'] ?? [];
    return data.map((json) => RestaurantModel.fromJson(json as Map<String, dynamic>)).toList();
  }
}
