// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'LightBite';

  @override
  String get tagline => 'Fast food, light experience';

  @override
  String get login => 'Login';

  @override
  String get register => 'Register';

  @override
  String get email => 'Email';

  @override
  String get password => 'Password';

  @override
  String get emailRequired => 'Email is required';

  @override
  String get passwordRequired => 'Password is required';

  @override
  String get loginFailedDefault =>
      'Login failed. Please check your credentials.';

  @override
  String get customer => 'Customer';

  @override
  String get driver => 'Driver';

  @override
  String get driverAppTitle => 'LightBite Driver';

  @override
  String get home => 'Home';

  @override
  String get cart => 'Cart';

  @override
  String get orders => 'Orders';

  @override
  String get profile => 'Profile';

  @override
  String get earnings => 'Earnings';

  @override
  String get history => 'History';

  @override
  String get deliverTo => 'Deliver to';

  @override
  String get searchPlaceholder => 'Search restaurants or dishes...';

  @override
  String restaurantsNearYou(int count) {
    return '$count restaurants near you';
  }

  @override
  String get minAbbrev => 'min';

  @override
  String get deliveryFee => 'Delivery Fee';

  @override
  String get deliveryFeeDefault => 'AED 5.00 delivery';

  @override
  String get subtotal => 'Subtotal';

  @override
  String get tax => 'Tax';

  @override
  String get total => 'Total';

  @override
  String get cartEmpty => 'Your cart is empty';

  @override
  String get cartEmptySubtitle => 'Add items from a restaurant to get started';

  @override
  String fromRestaurant(String name) {
    return 'From: $name';
  }

  @override
  String get proceedToCheckout => 'Proceed to Checkout';

  @override
  String minimumOrder(int minOrder, String shortfall) {
    return 'Minimum order: AED $minOrder. Add AED $shortfall more.';
  }

  @override
  String get noOrders => 'No orders yet';

  @override
  String get noOrdersSubtitle => 'Place your first order to see it here';

  @override
  String get active => 'Active';

  @override
  String orderNumber(String number) {
    return 'Order #$number';
  }

  @override
  String get deliveredStatus => 'Delivered!';

  @override
  String get onItsWay => 'On its way';

  @override
  String get orderProgress => 'Order Progress';

  @override
  String get driverAssigned => 'Driver assigned';

  @override
  String estimatedDelivery(int minutes) {
    return 'Est. $minutes min';
  }

  @override
  String get items => 'Items';

  @override
  String get youAreOffline => 'You are offline';

  @override
  String get tapToStartReceiving => 'Tap to start receiving delivery jobs';

  @override
  String get lookingForJobs => 'Looking for jobs...';

  @override
  String get notifyWhenAvailable =>
      'We\'ll notify you when a delivery is available';

  @override
  String get newDeliveryJob => 'New Delivery Job!';

  @override
  String get restaurantLabel => 'Restaurant';

  @override
  String get dropoff => 'Dropoff';

  @override
  String get distance => 'Distance';

  @override
  String pickupFrom(String name) {
    return 'Pick up from $name';
  }

  @override
  String get deliverToCustomer => 'Deliver to customer';

  @override
  String get confirmPickup => 'Confirm Pickup';

  @override
  String get confirmDelivery => 'Confirm Delivery';

  @override
  String get accept => 'Accept!';

  @override
  String get decline => 'Decline';

  @override
  String get todayEarnings => 'Today';

  @override
  String get trips => 'Trips';

  @override
  String get weekEarnings => 'Week';

  @override
  String get offlineBanner =>
      'You are offline. Some features may be unavailable.';

  @override
  String get dismiss => 'DISMISS';

  @override
  String get tryAgain => 'Try Again';

  @override
  String get loading => 'Loading...';

  @override
  String get errorOccurred => 'Something went wrong';

  @override
  String get noRestaurants => 'No restaurants found nearby';

  @override
  String get noAccountMessage => 'Don\'t have an account?';

  @override
  String get logout => 'Logout';

  @override
  String get save => 'Save';

  @override
  String get cancel => 'Cancel';

  @override
  String get orderNow => 'Order Now';

  @override
  String get placeOrder => 'Place Order';

  @override
  String get trackOrder => 'Track Order';

  @override
  String get orderHistory => 'Order History';

  @override
  String get statusPending => 'Pending';

  @override
  String get statusConfirmed => 'Confirmed';

  @override
  String get statusPreparing => 'Preparing';

  @override
  String get statusReady => 'Ready';

  @override
  String get statusPickedUp => 'Picked Up';

  @override
  String get statusDelivering => 'Delivering';

  @override
  String get statusDelivered => 'Delivered';

  @override
  String get statusCancelled => 'Cancelled';

  @override
  String get statusRejected => 'Rejected';

  @override
  String get today => 'Today';

  @override
  String get yesterday => 'Yesterday';

  @override
  String get addToCart => 'Add';

  @override
  String addedToCart(String item) {
    return '$item added to cart';
  }

  @override
  String get viewCart => 'View Cart';

  @override
  String get unavailable => 'Unavailable';

  @override
  String get noMenuItems => 'No menu items available';

  @override
  String get startDelivery => 'Start Delivery';
}
