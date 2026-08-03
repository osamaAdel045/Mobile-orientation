import 'package:flutter/material.dart';
import '../theme/extensions/lightbite_theme.dart';

class LBInput extends StatelessWidget {
  const LBInput({super.key, required this.controller, this.label, this.hint, this.icon,
    this.obscureText = false, this.validator, this.keyboardType, this.maxLines = 1, this.suffixIcon});

  final TextEditingController controller; final String? label; final String? hint;
  final IconData? icon; final bool obscureText; final String? Function(String?)? validator;
  final TextInputType? keyboardType; final int maxLines; final Widget? suffixIcon;

  @override
  Widget build(BuildContext context) {
    final theme = LightBiteTheme.of(context);
    return Semantics(
      label: label ?? hint ?? '',
      textField: true,
      child: TextFormField(
        controller: controller, obscureText: obscureText, validator: validator,
        keyboardType: keyboardType, maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label, hintText: hint,
          prefixIcon: icon != null ? Icon(icon) : null, suffixIcon: suffixIcon,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: theme.colors.neutral200)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: theme.colors.neutral200)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: theme.colors.primary500, width: 2)),
          errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: theme.colors.error)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }
}
