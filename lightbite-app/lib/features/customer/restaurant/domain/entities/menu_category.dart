import 'menu_item.dart';

/// A menu category containing a list of items.
class MenuCategory {
  const MenuCategory({
    required this.name,
    required this.items,
  });

  final String name;
  final List<MenuItem> items;
}
