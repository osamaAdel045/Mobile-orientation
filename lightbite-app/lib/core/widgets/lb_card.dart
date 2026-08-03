import 'package:flutter/material.dart';
import '../theme/extensions/lightbite_theme.dart';

class LBCard extends StatelessWidget {
  const LBCard({super.key, required this.child, this.onTap, this.padding, this.borderRadius});

  final Widget child; final VoidCallback? onTap; final double? padding; final double? borderRadius;

  @override
  Widget build(BuildContext context) {
    final theme = LightBiteTheme.of(context);
    final p = padding ?? 16;
    final r = borderRadius ?? 12;

    final card = Semantics(
      container: true,
      child: Container(
        decoration: BoxDecoration(
          color: theme.colors.cardBackground,
          borderRadius: BorderRadius.circular(r),
          border: Border.all(color: theme.colors.surfaceBorder),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 2, offset: const Offset(0, 1))],
        ),
        child: Padding(padding: EdgeInsets.all(p), child: child),
      ),
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(onTap: onTap, borderRadius: BorderRadius.circular(r), child: card),
      );
    }
    return card;
  }
}
