import 'package:get_it/get_it.dart';
import 'core_di.dart';
import 'auth_di.dart';
import 'home_di.dart';
import 'cart_di.dart';
import 'order_di.dart';
import 'address_di.dart';
import 'checkout_di.dart';
import 'restaurant_di.dart';
import 'driver_di.dart';
import 'theme_di.dart';

final sl = GetIt.instance;

Future<void> initDependencies() async {
  registerCore();
  registerAuth();
  registerHome();
  registerCart();
  registerOrder();
  registerAddress();
  registerRestaurant();
  registerCheckout();
  registerDriver();
  registerTheme();
}
