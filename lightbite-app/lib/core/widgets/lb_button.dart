import 'package:flutter/material.dart';
import '../theme/extensions/lightbite_theme.dart';

enum LBButtonVariant { primary, secondary, danger, ghost }
enum LBButtonSize { sm, md, lg }

class LBButton extends StatelessWidget {
  const LBButton({super.key, required this.label, required this.onPressed, this.variant = LBButtonVariant.primary,
    this.size = LBButtonSize.md, this.icon, this.loading = false, this.expanded = true});

  final String label; final VoidCallback? onPressed; final LBButtonVariant variant;
  final LBButtonSize size; final IconData? icon; final bool loading; final bool expanded;

  double get _height => switch (size) { LBButtonSize.sm => 32, LBButtonSize.md => 44, LBButtonSize.lg => 52 };
  double get _fontSize => switch (size) { LBButtonSize.sm => 14, LBButtonSize.md => 16, LBButtonSize.lg => 18 };

  @override
  Widget build(BuildContext context) {
    final theme = LightBiteTheme.of(context);
    final isDisabled = onPressed == null || loading;

    final Color bgColor = switch (variant) {
      LBButtonVariant.primary => isDisabled ? theme.colors.neutral200 : theme.colors.primary500,
      LBButtonVariant.secondary => Colors.transparent,
      LBButtonVariant.danger => isDisabled ? theme.colors.neutral200 : theme.colors.error,
      LBButtonVariant.ghost => Colors.transparent,
    };
    final Color fgColor = switch (variant) {
      LBButtonVariant.primary || LBButtonVariant.danger => Colors.white,
      LBButtonVariant.secondary => isDisabled ? theme.colors.neutral200 : theme.colors.neutral900,
      LBButtonVariant.ghost => isDisabled ? theme.colors.neutral200 : theme.colors.primary500,
    };
    final BorderSide? side = variant == LBButtonVariant.secondary ? BorderSide(color: theme.colors.neutral200) : null;

    final child = loading
        ? SizedBox(height: _fontSize, width: _fontSize, child: CircularProgressIndicator(strokeWidth: 2, color: fgColor))
        : Row(
            mainAxisSize: expanded ? MainAxisSize.max : MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[Icon(icon, size: _fontSize + 2), const SizedBox(width: 8)],
              Semantics(label: label, button: true,
                child: Text(label, style: TextStyle(fontSize: _fontSize, fontWeight: FontWeight.w600))),
            ],
          );

    return SizedBox(
      height: _height,
      child: TextButton(
        onPressed: isDisabled ? null : onPressed,
        style: TextButton.styleFrom(
          backgroundColor: bgColor, foregroundColor: fgColor,
          shape: RoundedRectangleBorder(borderRadius: theme.radius.sm, side: side ?? BorderSide.none),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          minimumSize: Size(expanded ? double.infinity : 0, _height),
        ),
        child: child,
      ),
    );
  }
}
