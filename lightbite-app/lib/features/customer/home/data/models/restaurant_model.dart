import 'package:equatable/equatable.dart';
import '../../../../../core/utils/valid_data.dart';
import '../../domain/entities/restaurant.dart';

class RestaurantModel extends Equatable {
  const RestaurantModel({
    required this.uuid,
    required this.name,
    this.cuisineTypes = const [],
    this.description,
    this.logoUrl,
    this.coverUrl,
    required this.address,
    required this.phone,
    this.lat,
    this.lng,
    this.distance,
    this.isAcceptingOrders,
    this.prepAvgTimeMin,
    this.deliveryFee,
    this.status,
  });

  final String uuid;
  final String name;
  final List<String> cuisineTypes;
  final String? description;
  final String? logoUrl;
  final String? coverUrl;
  final String address;
  final String phone;
  final double? lat;
  final double? lng;
  final double? distance;
  final bool? isAcceptingOrders;
  final int? prepAvgTimeMin;
  final String? deliveryFee;
  final String? status;

  factory RestaurantModel.fromJson(Map<String, dynamic> json) => RestaurantModel(
    uuid: validateString(json['uuid']),
    name: validateString(json['name']),
    cuisineTypes: validateList<String>(json['cuisine_types']),
    description: json['description'] != null ? validateString(json['description']) : null,
    logoUrl: json['logo_url'] != null ? validateString(json['logo_url']) : null,
    coverUrl: json['cover_url'] != null ? validateString(json['cover_url']) : null,
    address: validateString(json['address']),
    phone: validateString(json['phone']),
    lat: json['lat'] != null ? validateDouble(json['lat']) : null,
    lng: json['lng'] != null ? validateDouble(json['lng']) : null,
    distance: json['distance_km'] != null ? validateDouble(json['distance_km']) : null,
    isAcceptingOrders: json['is_open'] != null ? validateBool(json['is_open']) : null,
    prepAvgTimeMin: json['delivery_time_min'] != null ? validateInt(json['delivery_time_min']) : null,
    deliveryFee: json['delivery_fee'] != null ? validateString(json['delivery_fee']) : null,
    status: json['status'] != null ? validateString(json['status']) : null,
  );

  Map<String, dynamic> toJson() => {
    'uuid': uuid,
    'name': name,
    'cuisine_types': cuisineTypes,
    'description': description,
    'logo_url': logoUrl,
    'cover_url': coverUrl,
    'address': address,
    'phone': phone,
    'lat': lat,
    'lng': lng,
    'distance_km': distance,
    'is_open': isAcceptingOrders,
    'delivery_time_min': prepAvgTimeMin,
    'delivery_fee': deliveryFee,
    'status': status,
  };

  @override
  List<Object?> get props => [
    uuid,
    name,
    cuisineTypes,
    description,
    logoUrl,
    coverUrl,
    address,
    phone,
    lat,
    lng,
    distance,
    isAcceptingOrders,
    prepAvgTimeMin,
    deliveryFee,
    status,
  ];

  Restaurant toEntity() => Restaurant(
    uuid: uuid,
    name: name,
    cuisineTypes: cuisineTypes,
    description: description,
    logoUrl: logoUrl,
    coverUrl: coverUrl,
    address: address,
    lat: lat ?? 25.0801,
    lng: lng ?? 55.1400,
    distance: distance ?? 0,
    isAcceptingOrders: isAcceptingOrders ?? true,
    status: status ?? 'active',
    prepAvgTimeMin: prepAvgTimeMin ?? 20,
  );
}
