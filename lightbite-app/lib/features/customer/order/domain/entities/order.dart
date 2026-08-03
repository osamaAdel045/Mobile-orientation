import '../../../../../core/constants/app_enums.dart';

class OrderItem {
  final String name;
  final int quantity;
  final double unitPrice;

  const OrderItem({
    required this.name,
    required this.quantity,
    required this.unitPrice,
  });
}

class OrderStatusLog {
  final String from;
  final String to;
  final String changedBy;
  final String? note;
  final DateTime createdAt;

  const OrderStatusLog({
    required this.from,
    required this.to,
    required this.changedBy,
    this.note,
    required this.createdAt,
  });
}

class Order {
  final String uuid;
  final String orderNumber;
  final OrderStatus status;
  final String restaurantName;
  final String? driverName;
  final List<OrderItem> items;
  final double subtotal;
  final double deliveryFee;
  final double tax;
  final double total;
  final List<OrderStatusLog> timeline;
  final double? driverLat;
  final double? driverLng;
  final int? estimatedDeliveryMin;
  final DateTime createdAt;
  final bool? ratingGiven;

  const Order({
    required this.uuid,
    required this.orderNumber,
    required this.status,
    required this.restaurantName,
    this.driverName,
    required this.items,
    this.subtotal = 0,
    this.deliveryFee = 0,
    this.tax = 0,
    this.total = 0,
    this.timeline = const [],
    this.driverLat,
    this.driverLng,
    this.estimatedDeliveryMin,
    required this.createdAt,
    this.ratingGiven,
  });

  bool get isActive => status.isActive;

  int get currentStep => status.progressIndex;

  bool get hasDriver => driverLat != null && driverLng != null;
}
