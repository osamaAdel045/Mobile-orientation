import 'package:lightbite_app/core/network/api_client.dart';
import 'package:lightbite_app/features/theme/data/models/theme_config_model.dart';
import 'package:lightbite_app/features/theme/domain/entities/theme_config.dart';
import 'theme_remote_datasource.dart';

class ThemeRemoteDataSourceImpl implements ThemeRemoteDataSource {
  ThemeRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<ThemeConfig> fetchThemeConfig() async {
    final response = await _client.get('/theme/config');
    final data = response.data['data'] as Map<String, dynamic>;
    return ThemeConfigModel.fromJson(data).toEntity();
  }
}
