import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:lightbite_app/core/domain/entities/auth_user.dart';
import 'package:lightbite_app/core/theme/extensions/lightbite_theme.dart';
import 'package:lightbite_app/l10n/app_localizations.dart';
import 'package:lightbite_app/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:lightbite_app/features/auth/presentation/cubit/auth_state.dart';

class CustomerProfilePage extends StatelessWidget {
  const CustomerProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.profile)),
      body: BlocBuilder<AuthCubit, AuthState>(
        builder: (context, state) => state.maybeWhen(
          authenticated: (AuthUser user) => _buildProfile(context, user),
          orElse: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }

  Widget _buildProfile(BuildContext context,AuthUser  user) {
    final theme = LightBiteTheme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Avatar + name
        Center(
          child: Column(
            children: [
              CircleAvatar(
                radius: 48,
                backgroundColor: theme.colors.primary100,
                child: Text(
                  (user.name as String).isNotEmpty ? user.name[0].toUpperCase() : '?',
                  style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: theme.colors.primary500),
                ),
              ),
              const SizedBox(height: 16),
              Text(user.name as String, style: theme.typography.displayLarge),
              const SizedBox(height: 4),
              Text(user.email as String, style: theme.typography.bodyMedium.copyWith(color: theme.colors.neutral400)),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(color: theme.colors.primary100, borderRadius: theme.radius.full),
                child: Text((user.role).name as String,
                    style: TextStyle(color: theme.colors.primary600, fontSize: 12, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),

        // Menu
        _MenuItem(icon: Icons.receipt_long_outlined, title: l10n.orderHistory, subtitle: l10n.noOrdersSubtitle,
            onTap: () => context.go('/customer/orders')),
        _MenuItem(icon: Icons.location_on_outlined, title: 'Saved Addresses', subtitle: 'Manage your delivery addresses',
            onTap: () => context.push('/addresses')),
        _MenuItem(icon: Icons.payment_outlined, title: 'Payment Methods', subtitle: 'Manage saved cards', onTap: () {}),
        _MenuItem(icon: Icons.notifications_outlined, title: 'Notifications', subtitle: 'Push notification preferences', onTap: () {}),
        _MenuItem(icon: Icons.help_outline, title: 'Help & Support', subtitle: 'FAQs, contact us', onTap: () {}),
        _MenuItem(icon: Icons.info_outline, title: 'About LightBite', subtitle: 'Version 1.0.0', onTap: () {}),

        const SizedBox(height: 24),

        // Logout
        OutlinedButton.icon(
          onPressed: () { context.read<AuthCubit>().logout(); context.go('/login'); },
          icon: Icon(Icons.logout, color: theme.colors.error),
          label: Text('Logout', style: TextStyle(color: theme.colors.error)),
          style: OutlinedButton.styleFrom(side: BorderSide(color: theme.colors.error), padding: const EdgeInsets.symmetric(vertical: 14)),
        ),
        const SizedBox(height: 8),
        Center(child: Text('LightBite v1.0.0', style: theme.typography.labelMedium.copyWith(color: theme.colors.neutral200))),
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  const _MenuItem({required this.icon, required this.title, required this.subtitle, required this.onTap});
  final IconData icon; final String title; final String subtitle; final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = LightBiteTheme.of(context);
    return Card(
      child: ListTile(
        leading: Icon(icon, color: theme.colors.primary500),
        title: Text(title),
        subtitle: Text(subtitle, style: TextStyle(fontSize: 12, color: theme.colors.neutral400)),
        trailing: Icon(Icons.chevron_right, color: theme.colors.neutral200),
        onTap: onTap,
      ),
    );
  }
}
