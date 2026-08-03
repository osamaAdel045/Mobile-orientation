import 'menu_category.dart';

/// The full menu of a restaurant, including its name and categories.
class RestaurantMenu {
  const RestaurantMenu({
    required this.restaurantUuid,
    required this.restaurantName,
    required this.categories,
  });

  final String restaurantUuid;
  final String restaurantName;
  final List<MenuCategory> categories;
}
