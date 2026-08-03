import 'package:flutter/material.dart';
import '../../../../../core/constants/app_enums.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/widgets/lb_status_badge.dart';
import '../../../../../l10n/app_localizations.dart';
import '../../../order/domain/entities/order.dart';

class TrackingPage extends StatelessWidget {
  const TrackingPage({super.key, required this.order});

  final Order order;

  static const _steps = [
    OrderStatus.pending,
    OrderStatus.confirmed,
    OrderStatus.preparing,
    OrderStatus.ready,
    OrderStatus.assigned,
    OrderStatus.pickedUp,
    OrderStatus.delivering,
    OrderStatus.delivered,
  ];

  @override
  Widget build(BuildContext context) {
    final currentStep = order.currentStep;

    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.orderNumber(order.orderNumber)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.md),
        children: [
          // Status header
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                children: [
                  Icon(
                    currentStep >= _steps.length - 1
                        ? Icons.check_circle
                        : Icons.local_shipping,
                    size: 64,
                    color: currentStep >= _steps.length - 1
                        ? AppColors.success
                        : AppColors.primary500,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    currentStep >= _steps.length - 1
                        ? l10n.deliveredStatus
                        : l10n.onItsWay,
                    style: Theme.of(context).textTheme.headlineLarge,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    order.restaurantName,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: AppColors.neutral400),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  LBStatusBadge(order.status.apiValue),
                ],
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // Timeline
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.orderProgress,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  ...List.generate(_steps.length, (i) {
                    final isActive = i <= currentStep;
                    final isLast = i == _steps.length - 1;
                    return _TimelineStep(
                      label: _steps[i].label,
                      isActive: isActive,
                      isLast: isLast,
                      icon: _stepIcon(_steps[i]),
                    );
                  }),
                ],
              ),
            ),
          ),

          if (order.hasDriver) ...[
            const SizedBox(height: AppSpacing.md),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.driver,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        const Icon(Icons.person, color: AppColors.neutral400),
                        const SizedBox(width: AppSpacing.sm),
                        Text(order.driverName ?? l10n.driverAssigned),
                      ],
                    ),
                    if (order.estimatedDeliveryMin != null) ...[
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        children: [
                          const Icon(Icons.access_time,
                              color: AppColors.neutral400),
                          const SizedBox(width: AppSpacing.sm),
                          Text(l10n.estimatedDelivery(order.estimatedDeliveryMin!)),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],

          const SizedBox(height: AppSpacing.md),

          // Items summary
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.items,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  ...order.items.map((item) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('${item.quantity}x ${item.name}'),
                            Text('AED ${item.unitPrice.toStringAsFixed(2)}'),
                          ],
                        ),
                      )),
                  const Divider(),
                  _summaryRow(l10n.subtotal, order.subtotal),
                  _summaryRow(l10n.deliveryFee, order.deliveryFee),
                  _summaryRow(l10n.tax, order.tax),
                  _summaryRow(l10n.total, order.total, bold: true),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, double amount, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontWeight: bold ? FontWeight.w600 : null)),
          Text('AED ${amount.toStringAsFixed(2)}',
              style: TextStyle(fontWeight: bold ? FontWeight.w700 : null)),
        ],
      ),
    );
  }

  IconData _stepIcon(OrderStatus step) {
    switch (step) {
      case OrderStatus.pending: return Icons.hourglass_empty;
      case OrderStatus.confirmed: return Icons.check_circle_outline;
      case OrderStatus.preparing: return Icons.restaurant;
      case OrderStatus.ready: return Icons.inventory_2_outlined;
      case OrderStatus.assigned: return Icons.person_pin;
      case OrderStatus.pickedUp: return Icons.moped;
      case OrderStatus.delivering: return Icons.delivery_dining;
      case OrderStatus.delivered: return Icons.check_circle;
      default: return Icons.circle;
    }
  }
}

class _TimelineStep extends StatelessWidget {
  const _TimelineStep({
    required this.label,
    required this.isActive,
    required this.isLast,
    required this.icon,
  });

  final String label;
  final bool isActive;
  final bool isLast;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final color = isActive ? AppColors.primary500 : AppColors.neutral300;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: isActive ? color : Colors.transparent,
                  shape: BoxShape.circle,
                  border: Border.all(color: color, width: 2),
                ),
                child: Icon(icon, size: 14, color: isActive ? Colors.white : color),
              ),
              if (!isLast)
                Expanded(
                  child: Container(width: 2, color: color.withValues(alpha: 0.3)),
                ),
            ],
          ),
          const SizedBox(width: AppSpacing.sm),
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.lg),
            child: Text(
              label,
              style: TextStyle(
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                color: isActive ? AppColors.neutral900 : AppColors.neutral400,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
