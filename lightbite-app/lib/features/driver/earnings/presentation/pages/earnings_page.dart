import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../l10n/app_localizations.dart';
import '../../../../driver/home/presentation/cubit/driver_cubit.dart';
import '../../../../driver/home/presentation/cubit/driver_state.dart';

class DriverEarningsPage extends StatefulWidget {
  const DriverEarningsPage({super.key});

  @override
  State<DriverEarningsPage> createState() => _DriverEarningsPageState();
}

class _DriverEarningsPageState extends State<DriverEarningsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DriverCubit>().loadEarnings();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.earnings)),
      body: BlocBuilder<DriverCubit, DriverState>(
        builder: (context, state) {
          final earnings = state.maybeWhen(
            offline: (e) => e,
            waiting: (e) => e,
            jobOffered: (_, __) => null,
            onDelivery: (_, __) => null,
            error: (_) => null,
            orElse: () => null,
          );

          if (earnings == null) {
            return const Center(child: CircularProgressIndicator());
          }

          return ListView(
            padding: const EdgeInsets.all(AppSpacing.md),
            children: [
              // Summary cards
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      label: l10n.todayEarnings,
                      value: 'AED ${earnings.todayEarnings}',
                      color: AppColors.success,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: _StatCard(
                      label: l10n.weekEarnings,
                      value: 'AED ${earnings.weekEarnings}',
                      color: AppColors.primary500,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              _StatCard(
                label: l10n.trips,
                value: '${earnings.todayTrips} today / ${earnings.weekTrips} this week',
                color: AppColors.neutral700,
              ),
              const SizedBox(height: AppSpacing.sm),
              _StatCard(
                label: 'Average per trip',
                value: earnings.todayTrips > 0
                    ? 'AED ${(double.parse(earnings.todayEarnings) / earnings.todayTrips).toStringAsFixed(2)}'
                    : 'AED 0.00',
                color: AppColors.primary600,
              ),
            ],
          );
        },
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: AppColors.neutral400),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: Theme.of(context)
                  .textTheme
                  .bodyLarge
                  ?.copyWith(fontWeight: FontWeight.w700, color: color),
            ),
          ],
        ),
      ),
    );
  }
}
