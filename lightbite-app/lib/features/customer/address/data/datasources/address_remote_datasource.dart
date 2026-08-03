import '../../../../../core/network/api_client.dart';

abstract class AddressRemoteDataSource {
  Future<List<Map<String, dynamic>>> getAddresses();
  Future<Map<String, dynamic>> createAddress(Map<String, dynamic> data);
  Future<Map<String, dynamic>> updateAddress(String uuid, Map<String, dynamic> data);
  Future<void> deleteAddress(String uuid);
}

class AddressRemoteDataSourceImpl implements AddressRemoteDataSource {
  const AddressRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<List<Map<String, dynamic>>> getAddresses() async {
    final response = await _client.get('/addresses');
    return (response.data['data'] as List<dynamic>?)
            ?.cast<Map<String, dynamic>>() ??
        [];
  }

  @override
  Future<Map<String, dynamic>> createAddress(Map<String, dynamic> data) async {
    final response = await _client.post('/addresses', data: data);
    return response.data['data'] as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> updateAddress(String uuid, Map<String, dynamic> data) async {
    final response = await _client.put('/addresses/$uuid', data: data);
    return response.data['data'] as Map<String, dynamic>;
  }

  @override
  Future<void> deleteAddress(String uuid) async {
    await _client.delete('/addresses/$uuid');
  }
}
