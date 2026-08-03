import 'package:flutter/material.dart';
import '../constants/app_enums.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

class LBStatusBadge extends StatelessWidget {
  const LBStatusBadge(this.status, {super.key});

  final String status;

  OrderStatus get _orderStatus => OrderStatus.fromString(status);

  Color get _bgColor {
    switch (_orderStatus) {
      case OrderStatus.pending:
        return AppColors.warningLight;
      case OrderStatus.confirmed:
        return AppColors.infoLight;
      case OrderStatus.preparing:
        return AppColors.warningLight;
      case OrderStatus.ready:
        return AppColors.successLight;
      case OrderStatus.resolved:
        return AppColors.infoLight;
      case OrderStatus.delivered:
        return AppColors.successLight;
      case OrderStatus.assigned:
      case OrderStatus.pickedUp:
      case OrderStatus.delivering:
        return AppColors.primary100;
      case OrderStatus.cancelled:
      case OrderStatus.rejected:
      case OrderStatus.expired:
        return AppColors.errorLight;
      case OrderStatus.refunded:
        return AppColors.warningLight;
    }
  }

  Color get _fgColor {
    switch (_orderStatus) {
      case OrderStatus.pending:
        return AppColors.warning;
      case OrderStatus.confirmed:
        return AppColors.info;
      case OrderStatus.preparing:
        return AppColors.warning;
      case OrderStatus.ready:
        return AppColors.success;
      case OrderStatus.resolved:
        return AppColors.info;
      case OrderStatus.delivered:
        return AppColors.success;
      case OrderStatus.assigned:
      case OrderStatus.pickedUp:
      case OrderStatus.delivering:
        return AppColors.primary500;
      case OrderStatus.cancelled:
      case OrderStatus.rejected:
      case OrderStatus.expired:
        return AppColors.error;
      case OrderStatus.refunded:
        return AppColors.warning;
    }
  }

  IconData get _icon {
    switch (_orderStatus) {
      case OrderStatus.pending:
        return Icons.hourglass_bottom;
      case OrderStatus.confirmed:
        return Icons.check_circle_outline;
      case OrderStatus.preparing:
        return Icons.restaurant;
      case OrderStatus.ready:
        return Icons.inventory_2_outlined;
      case OrderStatus.assigned:
      case OrderStatus.pickedUp:
        return Icons.moped_outlined;
      case OrderStatus.delivering:
        return Icons.delivery_dining_outlined;
      case OrderStatus.delivered:
        return Icons.check_circle;
      case OrderStatus.cancelled:
      case OrderStatus.rejected:
      case OrderStatus.expired:
      case OrderStatus.refunded:
        return Icons.cancel_outlined;
      case OrderStatus.resolved:
        return Icons.check_circle;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _bgColor,
        borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_icon, size: 12, color: _fgColor),
          const SizedBox(width: 4),
          Text(
            _orderStatus.label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: _fgColor,
            ),
          ),
        ],
      ),
    );
  }
}
