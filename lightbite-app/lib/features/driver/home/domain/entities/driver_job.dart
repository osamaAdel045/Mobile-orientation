class DriverJob {
  final String orderUuid;
  final String orderNumber;
  final String restaurantName;
  final String restaurantAddress;
  final double restaurantLat;
  final double restaurantLng;
  final String customerAddress;
  final double customerLat;
  final double customerLng;
  final double earnings;
  final double distance;
  final int secondsLeft;

  const DriverJob({
    required this.orderUuid,
    required this.orderNumber,
    required this.restaurantName,
    required this.restaurantAddress,
    required this.restaurantLat,
    required this.restaurantLng,
    required this.customerAddress,
    required this.customerLat,
    required this.customerLng,
    required this.earnings,
    required this.distance,
    this.secondsLeft = 30,
  });
}

class DriverEarnings {
  final String todayEarnings;
  final int todayTrips;
  final String weekEarnings;
  final int weekTrips;

  const DriverEarnings({
    this.todayEarnings = '0.00',
    this.todayTrips = 0,
    this.weekEarnings = '0.00',
    this.weekTrips = 0,
  });
}

enum DriverStatus { offline, waiting, jobOffered, onDelivery }
