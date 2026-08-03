import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/widgets/lb_status_badge.dart';
import '../../../../../l10n/app_localizations.dart';
import '../../../../driver/home/presentation/cubit/driver_cubit.dart';
import '../../../../driver/home/presentation/cubit/driver_state.dart';

class DriverHistoryPage extends StatefulWidget {
  const DriverHistoryPage({super.key});

  @override
  State<DriverHistoryPage> createState() => _DriverHistoryPageState();
}

class _DriverHistoryPageState extends State<DriverHistoryPage> {
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
      appBar: AppBar(title: Text(l10n.history)),
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

          if (earnings.todayTrips == 0 && earnings.weekTrips == 0) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.history, size: 64, color: AppColors.neutral300),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'No deliveries yet',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: AppColors.neutral400,
                        ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Completed deliveries will appear here',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.neutral300,
                        ),
                  ),
                ],
              ),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(AppSpacing.md),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _count(label: l10n.todayEarnings, count: earnings.todayTrips.toString()),
                          _count(label: l10n.weekEarnings, count: earnings.weekTrips.toString()),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                'Total earnings: AED ${earnings.weekEarnings} this week',
                textAlign: TextAlign.center,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(color: AppColors.neutral400),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _count({required String label, required String count}) {
    return Column(
      children: [
        Text(
          count,
          style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        Text(
          label,
          style: Theme.of(context)
              .textTheme
              .bodySmall
              ?.copyWith(color: AppColors.neutral400),
        ),
      ],
    );
  }
}
