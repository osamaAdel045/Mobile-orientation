import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:lightbite_app/core/theme/extensions/lightbite_theme.dart';
import 'package:lightbite_app/l10n/app_localizations.dart';
import 'package:lightbite_app/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:lightbite_app/features/auth/presentation/cubit/auth_state.dart';

class DriverProfilePage extends StatelessWidget {
  const DriverProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.profile)),
      body: BlocBuilder<AuthCubit, AuthState>(
        builder: (context, state) => state.maybeWhen(
          authenticated: (user) => _buildProfile(context, user),
          orElse: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }

  Widget _buildProfile(BuildContext context, dynamic user) {
    final theme = LightBiteTheme.of(context);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Avatar + name
        Center(
          child: Column(
            children: [
              CircleAvatar(
                radius: 48,
                backgroundColor: theme.colors.successLight,
                child: Icon(Icons.person, size: 48, color: theme.colors.success),
              ),
              const SizedBox(height: 16),
              Text(user.name as String, style: theme.typography.displayLarge),
              const SizedBox(height: 4),
              Text(user.email as String, style: theme.typography.bodyMedium.copyWith(color: theme.colors.neutral400)),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(color: theme.colors.successLight, borderRadius: theme.radius.full),
                child: const Text('Driver', style: TextStyle(color: Color(0xFF16A34A), fontSize: 12, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),

        // Driver-specific menu
        _MenuItem(icon: Icons.directions_car_outlined, title: 'Vehicle & Documents',
            subtitle: 'License, registration, insurance', onTap: () {}),
        _MenuItem(icon: Icons.account_balance_wallet_outlined, title: 'Earnings & Payouts',
            subtitle: 'Weekly summary, payment history', onTap: () {}),
        _MenuItem(icon: Icons.star_outline, title: 'Ratings & Reviews',
            subtitle: 'Your driver rating and feedback', onTap: () {}),
        _MenuItem(icon: Icons.notifications_outlined, title: 'Notifications',
            subtitle: 'Job alerts and push preferences', onTap: () {}),
        _MenuItem(icon: Icons.help_outline, title: 'Help & Support',
            subtitle: 'FAQs, contact support', onTap: () {}),

        const SizedBox(height: 24),

        // Logout
        OutlinedButton.icon(
          onPressed: () { context.read<AuthCubit>().logout(); context.go('/login'); },
          icon: Icon(Icons.logout, color: theme.colors.error),
          label: const Text('Logout', style: TextStyle(color: Color(0xFFDC2626))),
          style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFFDC2626)), padding: const EdgeInsets.symmetric(vertical: 14)),
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
