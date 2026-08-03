import 'package:lightbite_app/core/network/api_client.dart';
import 'package:lightbite_app/core/utils/valid_data.dart';
import '../models/order_model.dart';

abstract class OrderRemoteDataSource {
  Future<List<OrderModel>> getOrders();

  Future<List<OrderModel>> getActiveOrders();

  Future<OrderModel> getOrderDetail(String uuid);

  Future<OrderModel> placeOrder(String addressUuid, {String? note});
}

class OrderRemoteDataSourceImpl implements OrderRemoteDataSource {
  OrderRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<List<OrderModel>> getOrders() async {
    final response = await _client.get('/orders');
    final List<dynamic> data = validateMap(response.data)['data']['data'] ?? [];
    return data.map((j) => OrderModel.fromJson(j as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<OrderModel>> getActiveOrders() async {
    final response = await _client.get('/home');
    final orderData = response.data['data']?['active_order'];
    if (orderData == null) return [];
    return [OrderModel.fromJson(orderData as Map<String, dynamic>)];
  }

  @override
  Future<OrderModel> getOrderDetail(String uuid) async {
    final response = await _client.get('/orders/$uuid');
    return OrderModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  @override
  Future<OrderModel> placeOrder(String addressUuid, {String? note}) async {
    final response = await _client.post(
      '/orders',
      data: {
        'delivery_address_uuid': addressUuid,
        'customer_note': note,
      },
      headers: {
        'Idempotency-Key': '${DateTime
            .now()
            .millisecondsSinceEpoch}-$addressUuid',
      },
    );
    return OrderModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }
}
