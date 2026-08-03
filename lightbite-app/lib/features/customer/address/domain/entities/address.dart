import 'package:equatable/equatable.dart';

class Address extends Equatable {
  const Address({
    required this.uuid,
    required this.label,
    required this.address,
    this.lat,
    this.lng,
    this.isDefault = false,
  });

  final String uuid;
  final String label;
  final String address;
  final double? lat;
  final double? lng;
  final bool isDefault;

  @override
  List<Object?> get props => [uuid, label, address, lat, lng, isDefault];
}
