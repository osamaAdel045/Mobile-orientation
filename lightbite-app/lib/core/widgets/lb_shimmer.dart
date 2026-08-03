import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

class LBShimmer extends StatelessWidget {
  const LBShimmer({
    super.key,
    this.height = 16,
    this.width,
    this.borderRadius = AppSpacing.radiusSm,
  });

  final double height;
  final double? width;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.neutral100,
      highlightColor: AppColors.neutral50,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.neutral100,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

class LBShimmerCard extends StatelessWidget {
  const LBShimmerCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.neutral100,
      highlightColor: AppColors.neutral50,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.neutral0,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          border: Border.all(color: AppColors.neutral100),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _Block(height: 160, borderRadius: AppSpacing.radiusSm),
            const SizedBox(height: AppSpacing.md),
            _Block(height: 20, width: 200),
            const SizedBox(height: AppSpacing.sm),
            _Block(height: 14, width: 150),
            const SizedBox(height: AppSpacing.md),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                _Block(height: 14, width: 80),
                _Block(height: 14, width: 100),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Block extends StatelessWidget {
  const _Block({this.height = 16, this.width, this.borderRadius = AppSpacing.radiusSm});
  final double height;
  final double? width;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.neutral100,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }
}
