/// A single menu item belonging to a restaurant category.
class MenuItem {
  const MenuItem({
    required this.uuid,
    required this.name,
    this.description,
    required this.price,
    this.imageUrl,
    required this.isAvailable,
  });

  final String uuid;
  final String name;
  final String? description;
  final double price;
  final String? imageUrl;
  final bool isAvailable;
}
