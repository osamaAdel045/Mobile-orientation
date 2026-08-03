class CartItem {
  final int? id;
  final int menuItemId;
  final String name;
  final int quantity;
  final int unitPriceFils;
  final String? specialInstructions;
  final String? menuItemUuid;
  final String? imageUrl;

  const CartItem({
    this.id,
    required this.menuItemId,
    required this.name,
    required this.quantity,
    required this.unitPriceFils,
    this.specialInstructions,
    this.menuItemUuid,
    this.imageUrl,
  });

  int get totalFils => unitPriceFils * quantity;
  double get unitPrice => unitPriceFils / 100;
  double get total => totalFils / 100;
}

class Cart {
  final String? uuid;
  final int? restaurantId;
  final String? restaurantName;
  final List<CartItem> items;
  final int subtotalFils;
  final int deliveryFeeFils;
  final int taxFils;
  final int totalFils;
  final int? minOrderFils;

  const Cart({
    this.uuid,
    this.restaurantId,
    this.restaurantName,
    required this.items,
    this.subtotalFils = 0,
    this.deliveryFeeFils = 0,
    this.taxFils = 0,
    this.totalFils = 0,
    this.minOrderFils = 2000,
  });

  double get subtotal => subtotalFils / 100;
  double get deliveryFee => deliveryFeeFils / 100;
  double get tax => taxFils / 100;
  double get total => totalFils / 100;
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
  bool get belowMinimum => subtotalFils < (minOrderFils ?? 2000);
  double get shortfall => ((minOrderFils ?? 2000) - subtotalFils) / 100;
}
