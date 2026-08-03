import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:lightbite_app/core/theme/extensions/lightbite_theme.dart';
import 'package:lightbite_app/core/widgets/lb_button.dart';
import 'package:lightbite_app/l10n/app_localizations.dart';
import 'package:lightbite_app/features/customer/cart/presentation/cubit/cart_cubit.dart';
import 'package:lightbite_app/features/customer/cart/presentation/cubit/cart_state.dart';
import 'package:lightbite_app/features/customer/checkout/presentation/cubit/checkout_cubit.dart';
import 'package:lightbite_app/features/customer/checkout/presentation/cubit/checkout_state.dart';
import 'package:lightbite_app/features/customer/order/presentation/cubit/order_cubit.dart';

class CheckoutPage extends StatelessWidget {
  const CheckoutPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return MultiBlocListener(
      listeners: [
        BlocListener<CheckoutCubit, CheckoutState>(
          listener: (context, state) {
            // Auto-select default address after load
            state.maybeWhen(
              ready: (addresses, selected, _) {
                if (selected == null && addresses.isNotEmpty) {
                  final defaultAddr = addresses.firstWhere(
                    (a) => a.isDefault,
                    orElse: () => addresses.first,
                  );
                  context.read<CheckoutCubit>().selectAddress(defaultAddr.uuid);
                }
              },
              orElse: () {},
            );
          },
        ),
      ],
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.placeOrder)),
        body: BlocBuilder<CheckoutCubit, CheckoutState>(
          builder: (context, state) {
            return state.maybeWhen(
              ready: (addresses, selected, placing) =>
                  BlocBuilder<CartCubit, CartState>(
                    builder: (context, cartState) {
                      return cartState.maybeWhen(
                        loaded: (cart) => _buildContent(context, cart, addresses, selected, placing, l10n),
                        orElse: () => const Center(child: CircularProgressIndicator()),
                      );
                    },
                  ),
              error: (msg) => Center(child: Text(msg)),
              orElse: () => const Center(child: CircularProgressIndicator()),
            );
          },
        ),
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    dynamic cart,
    List<dynamic> addresses,
    String? selectedUuid,
    bool placing,
    AppLocalizations l10n,
  ) {
    final theme = LightBiteTheme.of(context);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(l10n.home /* 'Delivery Address' */,
            style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 8),
        if (addresses.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Text('No saved addresses. Please add one first.'),
            ),
          )
        else
          ...addresses.map((addr) {
            final uuid = (addr as dynamic).uuid as String;
            final selected = uuid == selectedUuid;
            return Card(
              color: selected ? theme.colors.primary100 : null,
              shape: RoundedRectangleBorder(
                borderRadius: theme.radius.md,
                side: BorderSide(
                  color: selected ? theme.colors.primary500 : theme.colors.neutral200,
                  width: selected ? 2 : 1,
                ),
              ),
              child: RadioListTile<String>(
                value: uuid,
                groupValue: selectedUuid,
                onChanged: (v) => context.read<CheckoutCubit>().selectAddress(v!),
                title: Text(
                  (addr as dynamic).label as String,
                  style: TextStyle(fontWeight: selected ? FontWeight.w600 : FontWeight.w400),
                ),
                subtitle: Text(
                  (addr as dynamic).address as String,
                  style: const TextStyle(fontSize: 12),
                ),
                activeColor: theme.colors.primary500,
              ),
            );
          }),
        const SizedBox(height: 24),
        Text(l10n.orders,
            style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 8),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _row(l10n.subtotal, 'AED ${(cart.subtotalFils / 100).toStringAsFixed(2)}', context),
                _row(l10n.deliveryFee, 'AED ${(cart.deliveryFeeFils / 100).toStringAsFixed(2)}', context),
                const Divider(),
                _row(l10n.total, 'AED ${(cart.totalFils / 100).toStringAsFixed(2)}', context, bold: true),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        if (cart.restaurantName != null)
          Text(
            l10n.fromRestaurant(cart.restaurantName as String),
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: theme.colors.neutral400),
            textAlign: TextAlign.center,
          ),
        const SizedBox(height: 24),
        LBButton(
          label: placing ? 'Placing Order...' : l10n.placeOrder,
          onPressed: (selectedUuid != null && !placing)
              ? () => _placeOrder(context, selectedUuid)
              : null,
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _row(String label, String value, BuildContext context, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontWeight: bold ? FontWeight.w600 : FontWeight.w400)),
          Text(value, style: TextStyle(fontWeight: bold ? FontWeight.w700 : FontWeight.w400)),
        ],
      ),
    );
  }

  Future<void> _placeOrder(BuildContext context, String addressUuid) async {
    context.read<CheckoutCubit>().setPlacing(true);
    final result = await context.read<OrderCubit>().placeOrder(addressUuid);
    if (!context.mounted) return;
    result.fold(
      (failure) {
        context.read<CheckoutCubit>().setPlacing(false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(failure.message)),
        );
      },
      (order) {
        context.read<CartCubit>().clearCart();
        context.go('/order-confirmation', extra: order);
      },
    );
  }
}
