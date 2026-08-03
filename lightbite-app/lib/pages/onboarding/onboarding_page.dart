import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lightbite_app/core/theme/extensions/lightbite_theme.dart';
import 'package:lightbite_app/core/widgets/lb_button.dart';

/// Three-slide onboarding carousel shown before login.
///
/// Slides:
///   1. Discover restaurants near you
///   2. Track your order in real-time
///   3. Fast delivery to your door
class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _controller = PageController();
  final _currentPage = ValueNotifier<int>(0);

  @override
  void dispose() {
    _controller.dispose();
    _currentPage.dispose();
    super.dispose();
  }

  static const _slides = [
    _Slide(
      icon: Icons.restaurant_menu_rounded,
      title: 'Discover Restaurants',
      subtitle: 'Browse the best restaurants near you.\nFrom fast food to fine dining.',
    ),
    _Slide(
      icon: Icons.map_rounded,
      title: 'Track in Real-Time',
      subtitle: 'Watch your order move from the\nrestaurant to your doorstep.',
    ),
    _Slide(
      icon: Icons.delivery_dining_rounded,
      title: 'Fast Delivery',
      subtitle: 'Hot food, delivered quick.\nYour satisfaction guaranteed.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = LightBiteTheme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Skip button (top-right)
            Align(
              alignment: Alignment.topRight,
              child: TextButton(
                onPressed: () => _finish(context),
                child: Text('Skip',
                    style: TextStyle(color: theme.colors.neutral400)),
              ),
            ),

            // Slides
            Expanded(
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (i) => _currentPage.value = i,
                itemCount: _slides.length,
                itemBuilder: (_, i) => _slides[i].build(context, theme),
              ),
            ),

            // Dots + button
            Padding(
              padding: const EdgeInsets.fromLTRB(32, 16, 32, 40),
              child: Column(
                children: [
                  // Dot indicators
                  ValueListenableBuilder<int>(
                    valueListenable: _currentPage,
                    builder: (context, current, _) {
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(_slides.length, (i) {
                          final active = i == current;
                          return AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: active ? 24 : 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: active
                                  ? theme.colors.primary500
                                  : theme.colors.neutral200,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          );
                        }),
                      );
                    },
                  ),
                  const SizedBox(height: 24),

                  // Action button
                  ValueListenableBuilder<int>(
                    valueListenable: _currentPage,
                    builder: (context, current, _) {
                      final isLast = current == _slides.length - 1;
                      return LBButton(
                        label: isLast ? 'Get Started' : 'Next',
                        variant: LBButtonVariant.primary,
                        onPressed: () {
                          if (isLast) {
                            _finish(context);
                          } else {
                            _controller.nextPage(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeInOut,
                            );
                          }
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _finish(BuildContext context) {
    context.go('/login');
  }
}

class _Slide {
  final IconData icon;
  final String title;
  final String subtitle;
  const _Slide({required this.icon, required this.title, required this.subtitle});

  Widget build(BuildContext context, LightBiteTheme theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 140,
            height: 140,
            decoration: BoxDecoration(
              color: theme.colors.primary100,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 64, color: theme.colors.primary500),
          ),
          const SizedBox(height: 48),
          Text(title,
              textAlign: TextAlign.center,
              style: theme.typography.displayLarge.copyWith(
                  color: theme.colors.neutral900)),
          const SizedBox(height: 16),
          Text(subtitle,
              textAlign: TextAlign.center,
              style: theme.typography.bodyLarge.copyWith(
                  color: theme.colors.neutral400, height: 1.6)),
        ],
      ),
    );
  }
}
