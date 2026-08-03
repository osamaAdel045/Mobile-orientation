import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/widgets/lb_button.dart';
import '../../../../../core/widgets/lb_empty_state.dart';
import '../../../../../core/widgets/lb_error_widget.dart';
import '../../../../../l10n/app_localizations.dart';
import '../../../cart/domain/entities/cart_item.dart';
import '../cubit/cart_cubit.dart';
import '../cubit/cart_state.dart';

class CartPage extends StatefulWidget {
  const CartPage({super.key});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CartCubit>().loadCart();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.cart)),
      body: BlocBuilder<CartCubit, CartState>(
        builder: (context, state) {
          return state.when(
            empty: () => LBEmptyState(
              icon: Icons.shopping_cart_outlined,
              title: l10n.cartEmpty,
              subtitle: l10n.cartEmptySubtitle,
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            loaded: (cart) => _CartContent(cart: cart),
            error: (message) => LBErrorWidget(
              message: message,
              onRetry: () => context.read<CartCubit>().loadCart(),
            ),
          );
        },
      ),
    );
  }
}

class _CartContent extends StatelessWidget {
  const _CartContent({required this.cart});

  final Cart cart;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        // Restaurant name
        if (cart.restaurantName != null)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.md),
            color: AppColors.neutral50,
            child: Text(
              l10n.fromRestaurant(cart.restaurantName!),
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w600),
            ),
          ),

        // Items list
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.md),
            itemCount: cart.items.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final item = cart.items[index];
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.name,
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          if (item.specialInstructions != null)
                            Text(
                              '"${item.specialInstructions}"',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(color: AppColors.neutral400),
                            ),
                          Text(
                            'AED ${item.unitPrice.toStringAsFixed(2)}',
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(color: AppColors.neutral500),
                          ),
                        ],
                      ),
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline),
                          onPressed: () => context
                              .read<CartCubit>()
                              .updateQuantity(item.id ?? 0, item.quantity - 1),
                          color: AppColors.neutral400,
                        ),
                        Text(
                          '${item.quantity}',
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline),
                          onPressed: () => context
                              .read<CartCubit>()
                              .updateQuantity(item.id ?? 0, item.quantity + 1),
                          color: AppColors.primary500,
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ),

        // Bottom bar
        Container(
          decoration: BoxDecoration(
            color: AppColors.neutral0,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          padding: const EdgeInsets.all(AppSpacing.md),
          child: SafeArea(
            child: Column(
              children: [
                // Price breakdown
                _PriceRow(label: l10n.subtotal, amount: cart.subtotal),
                _PriceRow(label: l10n.deliveryFee, amount: cart.deliveryFee),
                _PriceRow(label: l10n.tax, amount: cart.tax),
                const Divider(),
                _PriceRow(label: l10n.total, amount: cart.total, bold: true),
                if (cart.belowMinimum) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    l10n.minimumOrder(
                      ((cart.minOrderFils ?? 2000) / 100).round(),
                      cart.shortfall.toStringAsFixed(2),
                    ),
                    style: const TextStyle(color: AppColors.error, fontSize: 12),
                  ),
                ],
                const SizedBox(height: AppSpacing.md),
                LBButton(
                  label: l10n.proceedToCheckout,
                  onPressed: cart.belowMinimum || cart.items.isEmpty
                      ? null
                      : () => context.push('/checkout'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _PriceRow extends StatelessWidget {
  const _PriceRow({
    required this.label,
    required this.amount,
    this.bold = false,
  });

  final String label;
  final double amount;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: bold ? FontWeight.w600 : FontWeight.w400,
                  color: bold ? AppColors.neutral900 : AppColors.neutral500,
                ),
          ),
          Text(
            'AED ${amount.toStringAsFixed(2)}',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
                ),
          ),
        ],
      ),
    );
  }
}
