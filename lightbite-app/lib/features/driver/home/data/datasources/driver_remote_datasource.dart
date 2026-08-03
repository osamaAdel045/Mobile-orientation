import 'package:lightbite_app/core/network/api_client.dart';
import '../models/driver_models.dart';

abstract class DriverRemoteDataSource {
  Future<void> toggleOnline(bool online);
  Future<Map<String, dynamic>> getDriverHome();
  Future<DriverEarningsModel> getEarnings();
  Future<void> acceptJob(String orderUuid);
  Future<void> declineJob(String orderUuid);
  Future<void> confirmPickup(String orderUuid);
  Future<void> startDelivery(String orderUuid);
  Future<void> confirmDelivery(String orderUuid);
}

class DriverRemoteDataSourceImpl implements DriverRemoteDataSource {
  DriverRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<void> toggleOnline(bool online) async {
    await _client.patch('/driver/status', data: {'is_online': online});
  }

  @override
  Future<Map<String, dynamic>> getDriverHome() async {
    final response = await _client.get('/driver/home');
    return response.data['data'] as Map<String, dynamic>;
  }

  @override
  Future<DriverEarningsModel> getEarnings() async {
    final response = await _client.get('/driver/earnings');
    return DriverEarningsModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  @override
  Future<void> acceptJob(String orderUuid) async {
    await _client.post('/driver/jobs/$orderUuid/accept');
  }

  @override
  Future<void> declineJob(String orderUuid) async {
    await _client.post('/driver/jobs/$orderUuid/decline');
  }

  @override
  Future<void> confirmPickup(String orderUuid) async {
    await _client.post('/driver/jobs/$orderUuid/pickup');
  }

  @override
  Future<void> startDelivery(String orderUuid) async {
    await _client.post('/driver/jobs/$orderUuid/start-delivery');
  }

  @override
  Future<void> confirmDelivery(String orderUuid) async {
    await _client.post('/driver/jobs/$orderUuid/deliver');
  }
}
