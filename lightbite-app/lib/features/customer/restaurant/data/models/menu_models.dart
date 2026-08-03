import '../../../../../core/utils/valid_data.dart';
import '../../domain/entities/menu_category.dart';
import '../../domain/entities/menu_item.dart';
import '../../domain/entities/restaurant_menu.dart';

class MenuResponse {
  final String restaurantUuid;
  final String restaurantName;
  final List<Map<String, dynamic>> categories;

  const MenuResponse({
    required this.restaurantUuid,
    required this.restaurantName,
    required this.categories,
  });

  factory MenuResponse.fromJson(Map<String, dynamic> json) {
    return MenuResponse(
      restaurantUuid: validateString(json['restaurant_uuid']),
      restaurantName: validateString(json['restaurant_name']),
      categories: (json['categories'] as List<dynamic>?)
              ?.whereType<Map<String, dynamic>>()
              .toList() ??
          [],
    );
  }

  RestaurantMenu toEntity() {
    return RestaurantMenu(
      restaurantUuid: restaurantUuid,
      restaurantName: restaurantName,
      categories: categories.map((cat) {
        final rawItems = (cat['items'] as List<dynamic>?)
                ?.whereType<Map<String, dynamic>>()
                .toList() ??
            [];
        return MenuCategory(
          name: validateString(cat['name']),
          items: rawItems.map((item) {
            return MenuItem(
              uuid: validateString(item['uuid']),
              name: validateString(item['name']),
              description: item['description'] != null
                  ? validateString(item['description'])
                  : null,
              price: validateDouble(item['price']),
              imageUrl: item['image_url'] != null
                  ? validateString(item['image_url'])
                  : null,
              isAvailable: item['is_available'] != null
                  ? validateBool(item['is_available'])
                  : true,
            );
          }).toList(),
        );
      }).toList(),
    );
  }
}
