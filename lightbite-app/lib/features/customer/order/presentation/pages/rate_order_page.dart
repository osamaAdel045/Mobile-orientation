import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lightbite_app/core/theme/extensions/lightbite_theme.dart';
import 'package:lightbite_app/core/widgets/lb_button.dart';
import 'package:lightbite_app/features/customer/order/domain/entities/order.dart';

/// Star rating + optional review after order delivery.
///
/// Per spec FR-RV01: 1-5 stars, optional text (max 500 chars),
/// one rating per order, available 7 days after delivery.
class RateOrderPage extends StatefulWidget {
  const RateOrderPage({super.key, required this.order});

  final Order order;

  @override
  State<RateOrderPage> createState() => _RateOrderPageState();
}

class _RateOrderPageState extends State<RateOrderPage> {
  final _rating = ValueNotifier<int>(0);
  final _review = TextEditingController();
  final _charCount = ValueNotifier<int>(0);
  bool _submitting = false;

  @override
  void dispose() {
    _rating.dispose();
    _review.dispose();
    _charCount.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = LightBiteTheme.of(context);
    final order = widget.order;

    return Scaffold(
      appBar: AppBar(title: const Text('Rate Your Order')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 16),

            // Restaurant name
            Icon(Icons.restaurant_rounded,
                size: 48, color: theme.colors.primary500),
            const SizedBox(height: 12),
            Text(order.restaurantName,
                style: theme.typography.displayLarge.copyWith(
                    color: theme.colors.neutral900),
                textAlign: TextAlign.center),
            const SizedBox(height: 4),
            Text('Order #${order.uuid.substring(0, 8).toUpperCase()}',
                style: theme.typography.bodyMedium.copyWith(
                    color: theme.colors.neutral400)),

            const SizedBox(height: 32),

            // Question
            Text('How was your meal?',
                style: theme.typography.titleLarge.copyWith(
                    color: theme.colors.neutral900)),
            const SizedBox(height: 20),

            // Stars
            ValueListenableBuilder<int>(
              valueListenable: _rating,
              builder: (context, value, _) {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (i) {
                    final filled = i < value;
                    return GestureDetector(
                      onTap: () => _rating.value = i + 1,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: Icon(
                          filled ? Icons.star_rounded : Icons.star_outline_rounded,
                          size: 48,
                          color: filled
                              ? theme.colors.warning
                              : theme.colors.neutral200,
                        ),
                      ),
                    );
                  }),
                );
              },
            ),

            const SizedBox(height: 12),

            // Rating labels
            ValueListenableBuilder<int>(
              valueListenable: _rating,
              builder: (context, value, _) {
                return Text(
                  switch (value) {
                    0 => 'Tap a star to rate',
                    1 => 'Poor',
                    2 => 'Fair',
                    3 => 'Good',
                    4 => 'Very Good',
                    5 => 'Excellent!',
                    _ => '',
                  },
                  style: theme.typography.bodyMedium.copyWith(
                      color: value > 0
                          ? theme.colors.warning
                          : theme.colors.neutral400,
                      fontWeight: FontWeight.w600),
                );
              },
            ),

            const SizedBox(height: 32),

            // Review text
            Align(
              alignment: Alignment.centerLeft,
              child: Text('Tell us more (optional)',
                  style: theme.typography.titleMedium.copyWith(
                      color: theme.colors.neutral900)),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _review,
              maxLines: 4,
              maxLength: 500,
              onChanged: (_) => _charCount.value = _review.text.length,
              decoration: InputDecoration(
                hintText: 'What did you like? Anything we can improve?',
                hintStyle: TextStyle(color: theme.colors.neutral400),
                border: OutlineInputBorder(
                  borderRadius: theme.radius.sm,
                  borderSide: BorderSide(color: theme.colors.neutral200),
                ),
              ),
            ),
            ValueListenableBuilder<int>(
              valueListenable: _charCount,
              builder: (context, count, _) {
                return Align(
                  alignment: Alignment.centerRight,
                  child: Text('$count/500',
                      style: theme.typography.labelMedium.copyWith(
                          color: count > 450
                              ? theme.colors.error
                              : theme.colors.neutral400)),
                );
              },
            ),

            const SizedBox(height: 32),

            // Submit
            ValueListenableBuilder<int>(
              valueListenable: _rating,
              builder: (context, value, _) {
                return LBButton(
                  label: _submitting ? 'Submitting...' : 'Submit Rating',
                  variant: LBButtonVariant.primary,
                  loading: _submitting,
                  onPressed: value > 0 ? _submit : null,
                );
              },
            ),

            const SizedBox(height: 12),

            // Skip
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Skip',
                  style: TextStyle(color: theme.colors.neutral400)),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    // TODO: Submit rating to backend via API
    // await context.read<OrderCubit>().rateOrder(
    //   orderUuid: widget.order.uuid,
    //   rating: _rating.value,
    //   review: _review.text.trim(),
    // );
    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Thank you for your feedback!')),
    );
    Navigator.of(context).pop();
  }
}
