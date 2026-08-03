class Restaurant {
  final String uuid;
  final String name;
  final List<String> cuisineTypes;
  final String? description;
  final String? logoUrl;
  final String? coverUrl;
  final double rating;
  final int reviewCount;
  final String address;
  final double lat;
  final double lng;
  final bool isAcceptingOrders;
  final String status;
  final int prepAvgTimeMin;
  final double distance;

  const Restaurant({
    required this.uuid,
    required this.name,
    required this.cuisineTypes,
    this.description,
    this.logoUrl,
    this.coverUrl,
    this.rating = 0,
    this.reviewCount = 0,
    required this.address,
    required this.lat,
    required this.lng,
    this.isAcceptingOrders = true,
    required this.status,
    this.prepAvgTimeMin = 20,
    this.distance = 0,
  });

  String get distanceDisplay => distance < 1
      ? '${(distance * 1000).round()}m'
      : '${distance.toStringAsFixed(1)}km';

  String get deliveryTimeDisplay => '$prepAvgTimeMin-${prepAvgTimeMin + 10} min';
}
