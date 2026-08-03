import '../entities/restaurant_menu.dart';

abstract class RestaurantRepository {
  Future<RestaurantMenu> getMenu(String restaurantUuid);
}
