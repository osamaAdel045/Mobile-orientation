import 'package:equatable/equatable.dart';
import '../../../../../core/utils/valid_data.dart';
import '../../domain/entities/cart_item.dart';

/// Matches API response: { id, menu_item: {uuid, name}, quantity, unit_price, subtotal, special_instructions }
class CartItemModel extends Equatable {
  const CartItemModel({
    this.id,
    this.menuItemUuid,
    this.name,
    this.quantity,
    this.unitPrice,
    this.specialInstructions,
  });

  final int? id;
  final String? menuItemUuid;
  final String? name;
  final int? quantity;
  final String? unitPrice;
  final String? specialInstructions;

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    final menuItem = json['menu_item'] as Map<String, dynamic>? ?? {};
    return CartItemModel(
      id: json['id'] != null ? validateInt(json['id']) : null,
      menuItemUuid: menuItem['uuid'] != null ? validateString(menuItem['uuid']) : null,
      name: menuItem['name'] != null ? validateString(menuItem['name']) : null,
      quantity: json['quantity'] != null ? validateInt(json['quantity']) : null,
      unitPrice: json['unit_price'] != null ? validateString(json['unit_price']) : null,
      specialInstructions: json['special_instructions'] != null ? validateString(json['special_instructions']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'menu_item_uuid': menuItemUuid,
        'name': name,
        'quantity': quantity,
        'unit_price': unitPrice,
        'special_instructions': specialInstructions,
      };

  @override
  List<Object?> get props => [id, menuItemUuid, name, quantity, unitPrice, specialInstructions];

  CartItem toEntity() => CartItem(
        id: id,
        menuItemId: 0,
        name: name ?? '',
        quantity: quantity ?? 0,
        unitPriceFils: ((double.tryParse(unitPrice ?? '0') ?? 0) * 100).round(),
        specialInstructions: specialInstructions,
        menuItemUuid: menuItemUuid,
      );
}

/// Matches API response: { uuid, restaurant: {uuid, name}, items, subtotal, expires_at }
class CartDataModel extends Equatable {
  const CartDataModel({
    this.uuid,
    this.restaurantUuid,
    this.restaurantName,
    this.items = const [],
    this.subtotal,
    this.expiresAt,
  });

  final String? uuid;
  final String? restaurantUuid;
  final String? restaurantName;
  final List<CartItemModel> items;
  final String? subtotal;
  final String? expiresAt;

  factory CartDataModel.fromJson(Map<String, dynamic> json) {
    final restaurant = json['restaurant'] as Map<String, dynamic>? ?? {};
    return CartDataModel(
      uuid: json['uuid'] != null ? validateString(json['uuid']) : null,
      restaurantUuid: restaurant['uuid'] != null ? validateString(restaurant['uuid']) : null,
      restaurantName: restaurant['name'] != null ? validateString(restaurant['name']) : null,
      items: validateJsonList(json['items'], CartItemModel.fromJson),
      subtotal: json['subtotal'] != null ? validateString(json['subtotal']) : null,
      expiresAt: json['expires_at'] != null ? validateString(json['expires_at']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'uuid': uuid,
        'restaurant': {'uuid': restaurantUuid, 'name': restaurantName},
        'items': items.map((i) => i.toJson()).toList(),
        'subtotal': subtotal,
        'expires_at': expiresAt,
      };

  @override
  List<Object?> get props => [uuid, restaurantUuid, restaurantName, items, subtotal, expiresAt];

  Cart toEntity() {
    final subtotalFils = ((double.tryParse(subtotal ?? '0') ?? 0) * 100).round();
    return Cart(
      uuid: uuid,
      restaurantId: null,
      restaurantName: restaurantName,
      items: items.map((i) => i.toEntity()).toList(),
      subtotalFils: subtotalFils,
      deliveryFeeFils: 500,
      taxFils: (subtotalFils * 0.05).round(),
      totalFils: subtotalFils + 500 + (subtotalFils * 0.05).round(),
      minOrderFils: 2000,
    );
  }
}
