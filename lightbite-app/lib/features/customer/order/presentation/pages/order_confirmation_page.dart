import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lightbite_app/core/theme/extensions/lightbite_theme.dart';
import 'package:lightbite_app/core/widgets/lb_button.dart';
import 'package:lightbite_app/features/customer/order/domain/entities/order.dart';

/// Shown immediately after a successful order placement.
///
/// Displays a success animation, order number, restaurant name,
/// estimated delivery time, and navigation to order tracking.
class OrderConfirmationPage extends StatelessWidget {
  const OrderConfirmationPage({super.key, required this.order});

  final Order order;

  @override
  Widget build(BuildContext context) {
    final theme = LightBiteTheme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(flex: 2),

              // Success icon
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: theme.colors.successLight,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.check_rounded,
                    size: 56, color: theme.colors.success),
              ),
              const SizedBox(height: 24),

              // Title
              Text('Order Placed!',
                  style: theme.typography.displayLarge.copyWith(
                      color: theme.colors.neutral900)),
              const SizedBox(height: 8),

              // Order number
              Text('Order #${order.uuid.substring(0, 8).toUpperCase()}',
                  style: theme.typography.titleLarge.copyWith(
                      color: theme.colors.primary500,
                      fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),

              // Restaurant + ETA
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                decoration: BoxDecoration(
                  color: theme.colors.neutral100,
                  borderRadius: theme.radius.md,
                  border: Border.all(color: theme.colors.neutral200),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.restaurant,
                            size: 18, color: theme.colors.neutral400),
                        const SizedBox(width: 8),
                        Text(order.restaurantName,
                            style: theme.typography.bodyLarge.copyWith(
                                color: theme.colors.neutral700)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.access_time_rounded,
                            size: 18, color: theme.colors.warning),
                        const SizedBox(width: 8),
                        Text('Estimated: 25–30 minutes',
                            style: theme.typography.bodyMedium.copyWith(
                                color: theme.colors.neutral400)),
                      ],
                    ),
                  ],
                ),
              ),

              const Spacer(flex: 2),

              // Track Order button
              LBButton(
                label: 'Track Order',
                variant: LBButtonVariant.primary,
                onPressed: () => context.go(
                  '/orders/${order.uuid}/track',
                  extra: order,
                ),
              ),
              const SizedBox(height: 12),

              // Back to Home
              LBButton(
                label: 'Continue Browsing',
                variant: LBButtonVariant.secondary,
                onPressed: () => context.go('/customer/home'),
              ),

              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}
