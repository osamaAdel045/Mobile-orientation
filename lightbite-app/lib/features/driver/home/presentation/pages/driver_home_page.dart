import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/widgets/lb_button.dart';
import '../../../../../core/widgets/lb_card.dart';
import '../../../../../l10n/app_localizations.dart';
import '../../../home/domain/entities/driver_job.dart';
import '../cubit/driver_cubit.dart';
import '../cubit/driver_state.dart';

class DriverHomePage extends StatefulWidget {
  const DriverHomePage({super.key});

  @override
  State<DriverHomePage> createState() => _DriverHomePageState();
}

class _DriverHomePageState extends State<DriverHomePage> {
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
      appBar: AppBar(
        title: Text(l10n.driverAppTitle),
        centerTitle: true,
      ),
      body: BlocBuilder<DriverCubit, DriverState>(
        builder: (context, state) {
          return state.when(
            offline: (earnings) => _buildOffline(context, earnings, l10n),
            waiting: (earnings) => _buildWaiting(context, earnings, l10n),
            jobOffered: (job, secondsLeft) => _buildJobOffer(context, job, secondsLeft, l10n),
            onDelivery: (job, phase) => _buildDelivery(context, job, phase, l10n),
            error: (message) => _buildOffline(context, null, l10n),
          );
        },
      ),
    );
  }

  Widget _buildOffline(BuildContext context, DriverEarnings? earnings, AppLocalizations l10n) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.moped_outlined, size: 80, color: AppColors.neutral300),
            const SizedBox(height: AppSpacing.lg),
            Text(l10n.youAreOffline, style: Theme.of(context).textTheme.headlineLarge),
            const SizedBox(height: AppSpacing.sm),
            Text(
              l10n.tapToStartReceiving,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: AppColors.neutral400),
            ),
            const SizedBox(height: AppSpacing.xl * 2),
            _OnlineToggle(isOnline: false),
            if (earnings != null) ...[
              const SizedBox(height: AppSpacing.xl),
              _EarningsSummary(earnings: earnings),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildWaiting(BuildContext context, DriverEarnings? earnings, AppLocalizations l10n) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(
              width: 80,
              height: 80,
              child: CircularProgressIndicator(strokeWidth: 4),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(l10n.lookingForJobs,
                style: Theme.of(context).textTheme.headlineLarge),
            const SizedBox(height: AppSpacing.sm),
            Text(
              l10n.notifyWhenAvailable,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: AppColors.neutral400),
            ),
            const SizedBox(height: AppSpacing.xl * 2),
            _OnlineToggle(isOnline: true),
            if (earnings != null) ...[
              const SizedBox(height: AppSpacing.xl),
              _EarningsSummary(earnings: earnings),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildJobOffer(BuildContext context, DriverJob job, int secondsLeft, AppLocalizations l10n) {
    final ratio = secondsLeft / 30;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Countdown
            SizedBox(
              width: 80,
              height: 80,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CircularProgressIndicator(
                    value: ratio,
                    strokeWidth: 6,
                    backgroundColor: AppColors.neutral100,
                    valueColor: AlwaysStoppedAnimation(
                      secondsLeft > 10 ? AppColors.primary500 : AppColors.error,
                    ),
                  ),
                  Center(
                    child: Text(
                      '$secondsLeft',
                      style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(l10n.newDeliveryJob,
                style: Theme.of(context).textTheme.headlineLarge),
            const SizedBox(height: AppSpacing.md),
            LBCard(
              child: Column(
                children: [
                  _offerRow(Icons.restaurant, job.restaurantName, l10n.restaurantLabel),
                  const SizedBox(height: AppSpacing.sm),
                  _offerRow(Icons.location_on, job.customerAddress, l10n.dropoff),
                  const SizedBox(height: AppSpacing.sm),
                  _offerRow(
                      Icons.straighten, '${job.distance.toStringAsFixed(1)} km', l10n.distance),
                  const SizedBox(height: AppSpacing.sm),
                  _offerRow(
                      Icons.attach_money, 'AED ${job.earnings.toStringAsFixed(2)}', l10n.earnings,
                      bold: true),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            Row(
              children: [
                Expanded(
                  child: LBButton(
                    label: l10n.decline,
                    onPressed: () => context.read<DriverCubit>().declineJob(),
                    variant: LBButtonVariant.secondary,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: LBButton(
                    label: l10n.accept,
                    onPressed: () => context.read<DriverCubit>().acceptJob(),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDelivery(BuildContext context, DriverJob job, String phase, AppLocalizations l10n) {
    final isPickup = phase == 'pickup';
    final isPickedUp = phase == 'picked_up';
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isPickup
                  ? Icons.restaurant
                  : isPickedUp
                      ? Icons.shopping_bag
                      : Icons.location_on,
              size: 80,
              color: AppColors.primary500,
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              isPickup
                  ? l10n.pickupFrom(job.restaurantName)
                  : isPickedUp
                      ? 'Picked up — ready to deliver'
                      : l10n.deliverToCustomer,
              style: Theme.of(context).textTheme.headlineLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              isPickup
                  ? job.restaurantAddress
                  : isPickedUp
                      ? job.customerAddress
                      : job.customerAddress,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: AppColors.neutral400),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.xl),
            LBButton(
              label: isPickup
                  ? l10n.confirmPickup
                  : isPickedUp
                      ? l10n.startDelivery
                      : l10n.confirmDelivery,
              onPressed: () {
                if (isPickup) {
                  context.read<DriverCubit>().confirmPickup();
                } else if (isPickedUp) {
                  context.read<DriverCubit>().startDelivery();
                } else {
                  context.read<DriverCubit>().confirmDelivery();
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _offerRow(IconData icon, String value, String label, {bool bold = false}) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.neutral400),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: const TextStyle(fontSize: 11, color: AppColors.neutral400)),
              Text(value,
                  style: TextStyle(
                    fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
                  )),
            ],
          ),
        ),
      ],
    );
  }
}

class _OnlineToggle extends StatelessWidget {
  const _OnlineToggle({required this.isOnline});

  final bool isOnline;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.read<DriverCubit>().toggleOnline(),
      child: Container(
        width: 120,
        height: 120,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isOnline ? AppColors.success : AppColors.neutral200,
          boxShadow: [
            BoxShadow(
              color: (isOnline ? AppColors.success : AppColors.neutral400)
                  .withValues(alpha: 0.3),
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Icon(
          Icons.power_settings_new,
          size: 48,
          color: isOnline ? Colors.white : AppColors.neutral400,
        ),
      ),
    );
  }
}

class _EarningsSummary extends StatelessWidget {
  const _EarningsSummary({required this.earnings});

  final DriverEarnings earnings;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Column(
          children: [
            Text('AED ${earnings.todayEarnings}',
                style: Theme.of(context)
                    .textTheme
                    .headlineLarge
                    ?.copyWith(fontWeight: FontWeight.bold)),
            Text(l10n.todayEarnings,
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: AppColors.neutral400)),
          ],
        ),
        Column(
          children: [
            Text('${earnings.todayTrips}',
                style: Theme.of(context)
                    .textTheme
                    .headlineLarge
                    ?.copyWith(fontWeight: FontWeight.bold)),
            Text(l10n.trips,
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: AppColors.neutral400)),
          ],
        ),
        Column(
          children: [
            Text('AED ${earnings.weekEarnings}',
                style: Theme.of(context)
                    .textTheme
                    .headlineLarge
                    ?.copyWith(fontWeight: FontWeight.bold)),
            Text(l10n.weekEarnings,
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: AppColors.neutral400)),
          ],
        ),
      ],
    );
  }
}
