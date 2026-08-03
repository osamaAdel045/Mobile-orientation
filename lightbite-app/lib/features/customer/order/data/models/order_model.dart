import 'package:equatable/equatable.dart';
import '../../../../../core/constants/app_enums.dart';
import '../../../../../core/utils/valid_data.dart';
import '../../domain/entities/order.dart';

class OrderItemModel extends Equatable {
  const OrderItemModel({
    required this.name,
    required this.quantity,
    this.unitPrice,
  });

  final String name;
  final int quantity;
  final String? unitPrice;

  factory OrderItemModel.fromJson(Map<String, dynamic> json) => OrderItemModel(
        name: validateString(json['name']),
        quantity: validateInt(json['quantity']),
        unitPrice: json['unit_price'] != null
            ? validateString(json['unit_price'])
            : null,
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'quantity': quantity,
        'unit_price': unitPrice,
      };

  @override
  List<Object?> get props => [name, quantity, unitPrice];

  OrderItem toEntity() => OrderItem(
        name: name,
        quantity: quantity,
        unitPrice: double.tryParse(unitPrice ?? '0') ?? 0,
      );
}

class OrderStatusLogModel extends Equatable {
  const OrderStatusLogModel({
    required this.from,
    required this.to,
    required this.by,
    this.note,
    this.at,
  });

  final String from;
  final String to;
  final String by;
  final String? note;
  final String? at;

  factory OrderStatusLogModel.fromJson(Map<String, dynamic> json) =>
      OrderStatusLogModel(
        from: validateString(json['from']),
        to: validateString(json['to']),
        by: validateString(json['by']),
        note: json['note'] != null ? validateString(json['note']) : null,
        at: json['at'] != null ? validateString(json['at']) : null,
      );

  Map<String, dynamic> toJson() => {
        'from': from,
        'to': to,
        'by': by,
        'note': note,
        'at': at,
      };

  @override
  List<Object?> get props => [from, to, by, note, at];

  OrderStatusLog toEntity() => OrderStatusLog(
        from: from,
        to: to,
        changedBy: by,
        note: note,
        createdAt: at != null ? DateTime.tryParse(at!) ?? DateTime.now() : DateTime.now(),
      );
}

class OrderModel extends Equatable {
  const OrderModel({
    required this.uuid,
    required this.orderNumber,
    required this.status,
    this.restaurantName,
    this.driverName,
    this.items = const [],
    this.subtotal,
    this.deliveryFee,
    this.tax,
    this.total,
    this.timeline = const [],
    this.driverLat,
    this.driverLng,
    this.estimatedDeliveryMin,
    this.createdAt,
  });

  final String uuid;
  final String orderNumber;
  final String status;
  final String? restaurantName;
  final String? driverName;
  final List<OrderItemModel> items;
  final String? subtotal;
  final String? deliveryFee;
  final String? tax;
  final String? total;
  final List<OrderStatusLogModel> timeline;
  final double? driverLat;
  final double? driverLng;
  final int? estimatedDeliveryMin;
  final String? createdAt;

  factory OrderModel.fromJson(Map<String, dynamic> json) => OrderModel(
        uuid: validateString(json['uuid']),
        orderNumber: validateString(json['order_number']),
        status: validateString(json['status']),
        restaurantName: json['restaurant_name'] != null
            ? validateString(json['restaurant_name'])
            : null,
        driverName: json['driver_name'] != null
            ? validateString(json['driver_name'])
            : null,
        items: validateJsonList(json['items'], OrderItemModel.fromJson),
        subtotal: json['subtotal'] != null
            ? validateString(json['subtotal'])
            : null,
        deliveryFee: json['delivery_fee'] != null
            ? validateString(json['delivery_fee'])
            : null,
        tax: json['tax'] != null ? validateString(json['tax']) : null,
        total: json['total'] != null ? validateString(json['total']) : null,
        timeline: validateJsonList(json['timeline'], OrderStatusLogModel.fromJson),
        driverLat: json['driver_lat'] != null ? validateDouble(json['driver_lat']) : null,
        driverLng: json['driver_lng'] != null ? validateDouble(json['driver_lng']) : null,
        estimatedDeliveryMin: json['estimated_delivery_min'] != null ? validateInt(json['estimated_delivery_min']) : null,
        createdAt: json['created_at'] != null ? validateString(json['created_at']) : null,
      );

  Map<String, dynamic> toJson() => {
        'uuid': uuid,
        'order_number': orderNumber,
        'status': status,
        'restaurant_name': restaurantName,
        'driver_name': driverName,
        'items': items.map((i) => i.toJson()).toList(),
        'subtotal': subtotal,
        'delivery_fee': deliveryFee,
        'tax': tax,
        'total': total,
        'timeline': timeline.map((t) => t.toJson()).toList(),
        'driver_lat': driverLat,
        'driver_lng': driverLng,
        'estimated_delivery_min': estimatedDeliveryMin,
        'created_at': createdAt,
      };

  @override
  List<Object?> get props => [
        uuid, orderNumber, status, restaurantName, driverName,
        items, subtotal, deliveryFee, tax, total, timeline,
        driverLat, driverLng, estimatedDeliveryMin, createdAt,
      ];

  Order toEntity() => Order(
        uuid: uuid,
        orderNumber: orderNumber,
        status: OrderStatus.fromString(status),
        restaurantName: restaurantName ?? '',
        driverName: driverName,
        items: items.map((i) => i.toEntity()).toList(),
        subtotal: double.tryParse(subtotal ?? '0') ?? 0,
        deliveryFee: double.tryParse(deliveryFee ?? '0') ?? 0,
        tax: double.tryParse(tax ?? '0') ?? 0,
        total: double.tryParse(total ?? '0') ?? 0,
        timeline: timeline.map((t) => t.toEntity()).toList(),
        driverLat: driverLat,
        driverLng: driverLng,
        estimatedDeliveryMin: estimatedDeliveryMin,
        createdAt: DateTime.tryParse(createdAt ?? '') ?? DateTime.now(),
      );
}
