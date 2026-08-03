import 'package:equatable/equatable.dart';
import '../../../../../core/utils/valid_data.dart';
import '../../domain/entities/driver_job.dart';

class DriverJobModel extends Equatable {
  const DriverJobModel({
    required this.orderUuid,
    required this.orderNumber,
    required this.restaurantName,
    this.restaurantAddress,
    this.restaurantLat,
    this.restaurantLng,
    this.customerAddress,
    this.customerLat,
    this.customerLng,
    this.earnings,
    this.distance,
  });

  final String orderUuid;
  final String orderNumber;
  final String restaurantName;
  final String? restaurantAddress;
  final double? restaurantLat;
  final double? restaurantLng;
  final String? customerAddress;
  final double? customerLat;
  final double? customerLng;
  final String? earnings;
  final double? distance;

  factory DriverJobModel.fromJson(Map<String, dynamic> json) => DriverJobModel(
        orderUuid: validateString(json['order_uuid']),
        orderNumber: validateString(json['order_number']),
        restaurantName: validateString(json['restaurant_name']),
        restaurantAddress: json['restaurantAddress'] != null ? validateString(json['restaurantAddress']) : null,
        restaurantLat: json['restaurant_lat'] != null ? validateDouble(json['restaurant_lat']) : null,
        restaurantLng: json['restaurant_lng'] != null ? validateDouble(json['restaurant_lng']) : null,
        customerAddress: json['customer_address'] != null ? validateString(json['customer_address']) : null,
        customerLat: json['customer_lat'] != null ? validateDouble(json['customer_lat']) : null,
        customerLng: json['customer_lng'] != null ? validateDouble(json['customer_lng']) : null,
        earnings: json['earnings'] != null ? validateString(json['earnings']) : null,
        distance: json['distance'] != null ? validateDouble(json['distance']) : null,
      );

  Map<String, dynamic> toJson() => {
        'order_uuid': orderUuid,
        'order_number': orderNumber,
        'restaurant_name': restaurantName,
        'restaurantAddress': restaurantAddress,
        'restaurant_lat': restaurantLat,
        'restaurant_lng': restaurantLng,
        'customer_address': customerAddress,
        'customer_lat': customerLat,
        'customer_lng': customerLng,
        'earnings': earnings,
        'distance': distance,
      };

  @override
  List<Object?> get props => [
        orderUuid, orderNumber, restaurantName, restaurantAddress,
        restaurantLat, restaurantLng, customerAddress, customerLat,
        customerLng, earnings, distance,
      ];

  DriverJob toEntity() => DriverJob(
        orderUuid: orderUuid,
        orderNumber: orderNumber,
        restaurantName: restaurantName,
        restaurantAddress: restaurantAddress ?? '',
        restaurantLat: restaurantLat ?? 0,
        restaurantLng: restaurantLng ?? 0,
        customerAddress: customerAddress ?? '',
        customerLat: customerLat ?? 0,
        customerLng: customerLng ?? 0,
        earnings: double.tryParse(earnings ?? '0') ?? 0,
        distance: distance ?? 0,
      );
}

class DriverEarningsModel extends Equatable {
  const DriverEarningsModel({
    this.todayEarnings,
    this.todayTrips,
    this.weekEarnings,
    this.weekTrips,
  });

  final String? todayEarnings;
  final int? todayTrips;
  final String? weekEarnings;
  final int? weekTrips;

  factory DriverEarningsModel.fromJson(Map<String, dynamic> json) =>
      DriverEarningsModel(
        todayEarnings: json['today_earnings'] != null ? validateString(json['today_earnings']) : null,
        todayTrips: json['today_trips'] != null ? validateInt(json['today_trips']) : null,
        weekEarnings: json['this_week_earnings'] != null ? validateString(json['this_week_earnings']) : null,
        weekTrips: json['this_week_trips'] != null ? validateInt(json['this_week_trips']) : null,
      );

  Map<String, dynamic> toJson() => {
        'today_earnings': todayEarnings,
        'today_trips': todayTrips,
        'this_week_earnings': weekEarnings,
        'this_week_trips': weekTrips,
      };

  @override
  List<Object?> get props => [todayEarnings, todayTrips, weekEarnings, weekTrips];

  DriverEarnings toEntity() => DriverEarnings(
        todayEarnings: todayEarnings ?? '0.00',
        todayTrips: todayTrips ?? 0,
        weekEarnings: weekEarnings ?? '0.00',
        weekTrips: weekTrips ?? 0,
      );
}
