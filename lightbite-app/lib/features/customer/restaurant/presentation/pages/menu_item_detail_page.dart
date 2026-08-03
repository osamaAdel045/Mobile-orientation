import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lightbite_app/core/theme/extensions/lightbite_theme.dart';
import 'package:lightbite_app/core/widgets/lb_button.dart';
import 'package:lightbite_app/features/customer/cart/presentation/cubit/cart_cubit.dart';
import 'package:lightbite_app/features/customer/restaurant/domain/entities/menu_item.dart';

/// Full-screen detail for a single menu item.
///
/// Displays the item image, name, description, price, a quantity selector,
/// an optional special instructions field, and an Add to Cart button.
class MenuItemDetailPage extends StatefulWidget {
  const MenuItemDetailPage({
    super.key,
    required this.item,
    required this.restaurantName,
  });

  final MenuItem item;
  final String restaurantName;

  @override
  State<MenuItemDetailPage> createState() => _MenuItemDetailPageState();
}

class _MenuItemDetailPageState extends State<MenuItemDetailPage> {
  final _quantity = ValueNotifier<int>(1);
  final _instructions = TextEditingController();
  bool _adding = false;

  @override
  void dispose() {
    _quantity.dispose();
    _instructions.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = LightBiteTheme.of(context);
    final item = widget.item;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // ── Image ──
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: item.imageUrl != null && item.imageUrl!.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: item.imageUrl!,
                      fit: BoxFit.cover,
                      placeholder: (_, __) =>
                          Container(color: theme.colors.neutral100),
                      errorWidget: (_, __, ___) =>
                          Container(color: theme.colors.neutral100),
                    )
                  : Container(color: theme.colors.neutral100),
            ),
          ),

          // ── Content ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Name & price
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(item.name,
                            style: theme.typography.displayLarge.copyWith(
                                color: theme.colors.neutral900)),
                      ),
                      const SizedBox(width: 16),
                      Text('AED ${item.price.toStringAsFixed(2)}',
                          style: theme.typography.titleLarge.copyWith(
                              color: theme.colors.primary500,
                              fontWeight: FontWeight.w700)),
                    ],
                  ),

                  if (item.description != null && item.description!.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(item.description!,
                        style: theme.typography.bodyMedium.copyWith(
                            color: theme.colors.neutral400)),
                  ],

                  // Restaurant info
                  if (widget.restaurantName.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.restaurant,
                            size: 14, color: theme.colors.neutral400),
                        const SizedBox(width: 4),
                        Text(widget.restaurantName,
                            style: theme.typography.labelMedium.copyWith(
                                color: theme.colors.neutral400)),
                      ],
                    ),
                  ],

                  const SizedBox(height: 24),

                  // Quantity selector
                  Text('Quantity',
                      style: theme.typography.titleMedium.copyWith(
                          color: theme.colors.neutral900)),
                  const SizedBox(height: 8),
                  ValueListenableBuilder<int>(
                    valueListenable: _quantity,
                    builder: (context, qty, _) {
                      return Row(
                        children: [
                          _QtyButton(
                            icon: Icons.remove,
                            onTap: qty > 1
                                ? () => _quantity.value = qty - 1
                                : null,
                          ),
                          const SizedBox(width: 16),
                          SizedBox(
                            width: 32,
                            child: Text('$qty',
                                textAlign: TextAlign.center,
                                style: theme.typography.titleLarge),
                          ),
                          const SizedBox(width: 16),
                          _QtyButton(
                            icon: Icons.add,
                            onTap: () => _quantity.value = qty + 1,
                          ),
                        ],
                      );
                    },
                  ),

                  const SizedBox(height: 24),

                  // Special instructions
                  Text('Special Instructions',
                      style: theme.typography.titleMedium.copyWith(
                          color: theme.colors.neutral900)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _instructions,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'E.g., no onions, extra cheese',
                      hintStyle: TextStyle(color: theme.colors.neutral400),
                      border: OutlineInputBorder(
                        borderRadius: theme.radius.sm,
                        borderSide:
                            BorderSide(color: theme.colors.neutral200),
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Add to Cart button
                  ValueListenableBuilder<int>(
                    valueListenable: _quantity,
                    builder: (context, qty, _) {
                      final total = item.price * qty;
                      return LBButton(
                        label: _adding
                            ? 'Adding...'
                            : 'Add to Cart — AED ${total.toStringAsFixed(2)}',
                        variant: LBButtonVariant.primary,
                        loading: _adding,
                        onPressed: item.isAvailable ? () => _addToCart(context) : null,
                      );
                    },
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _addToCart(BuildContext context) async {
    setState(() => _adding = true);
    final instructions = _instructions.text.trim();
    await context.read<CartCubit>().addItem(
          widget.item.uuid,
          _quantity.value,
          instructions: instructions.isNotEmpty ? instructions : null,
        );
    if (!mounted) return;
    setState(() => _adding = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${widget.item.name} added to cart'),
        duration: const Duration(seconds: 1),
      ),
    );
    Navigator.of(context).pop();
  }
}

class _QtyButton extends StatelessWidget {
  const _QtyButton({required this.icon, this.onTap});
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = LightBiteTheme.of(context);
    final enabled = onTap != null;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: enabled ? theme.colors.primary100 : theme.colors.neutral100,
          borderRadius: theme.radius.sm,
          border: Border.all(
            color: enabled ? theme.colors.primary500 : theme.colors.neutral200,
          ),
        ),
        child: Icon(icon,
            size: 20,
            color: enabled
                ? theme.colors.primary500
                : theme.colors.neutral400),
      ),
    );
  }
}
