import 'package:lightbite_app/core/network/api_client.dart';
import '../models/cart_model.dart';

abstract class CartRemoteDataSource {
  Future<CartDataModel> getCart();
  Future<CartDataModel> addItem(String menuItemUuid, int quantity, String? instructions);
  Future<CartDataModel> updateItem(int itemId, int quantity);
  Future<void> removeItem(int itemId);
  Future<void> clearCart();
}

class CartRemoteDataSourceImpl implements CartRemoteDataSource {
  CartRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<CartDataModel> getCart() async {
    final response = await _client.get('/cart');
    final data = response.data['data'];
    if (data == null) return const CartDataModel();
    return CartDataModel.fromJson(data as Map<String, dynamic>);
  }

  @override
  Future<CartDataModel> addItem(String menuItemUuid, int quantity, String? instructions) async {
    final response = await _client.post('/cart/items', data: {
      'menu_item_uuid': menuItemUuid,
      'quantity': quantity,
      'special_instructions': instructions,
    });
    return CartDataModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  @override
  Future<CartDataModel> updateItem(int itemId, int quantity) async {
    final response = await _client.patch('/cart/items/$itemId', data: {
      'quantity': quantity,
    });
    return CartDataModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  @override
  Future<void> removeItem(int itemId) async {
    await _client.delete('/cart/items/$itemId');
  }

  @override
  Future<void> clearCart() async {
    await _client.delete('/cart');
  }
}
