import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:lightbite_app/app/di/injection_container.dart';
import 'package:lightbite_app/core/constants/app_enums.dart';
import 'package:lightbite_app/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:lightbite_app/features/auth/presentation/cubit/auth_state.dart';
import 'package:lightbite_app/features/auth/presentation/pages/login_page.dart';
import 'package:lightbite_app/features/auth/presentation/pages/register_page.dart';
import 'package:lightbite_app/features/customer/address/presentation/pages/address_page.dart';
import 'package:lightbite_app/features/customer/address/presentation/pages/location_picker_page.dart';
import 'package:lightbite_app/features/customer/cart/presentation/cubit/cart_cubit.dart';
import 'package:lightbite_app/features/customer/cart/presentation/pages/cart_page.dart';
import 'package:lightbite_app/features/customer/checkout/presentation/cubit/checkout_cubit.dart';
import 'package:lightbite_app/features/customer/checkout/presentation/pages/checkout_page.dart';
import 'package:lightbite_app/features/customer/address/presentation/cubit/address_cubit.dart';
import 'package:lightbite_app/features/customer/home/presentation/cubit/home_cubit.dart';
import 'package:lightbite_app/features/customer/home/presentation/pages/home_page.dart';
import 'package:lightbite_app/features/customer/order/presentation/cubit/order_cubit.dart';
import 'package:lightbite_app/features/customer/order/presentation/pages/order_history_page.dart';
import 'package:lightbite_app/features/customer/order/presentation/pages/tracking_page.dart';
import 'package:lightbite_app/features/customer/profile/presentation/pages/profile_page.dart';
import 'package:lightbite_app/features/customer/restaurant/presentation/cubit/menu_cubit.dart';
import 'package:lightbite_app/features/customer/restaurant/presentation/pages/restaurant_detail_page.dart';
import 'package:lightbite_app/features/driver/earnings/presentation/pages/earnings_page.dart';
import 'package:lightbite_app/features/driver/history/presentation/pages/history_page.dart';
import 'package:lightbite_app/features/driver/home/presentation/cubit/driver_cubit.dart';
import 'package:lightbite_app/features/driver/home/presentation/pages/driver_home_page.dart';
import 'package:lightbite_app/features/customer/home/presentation/pages/search_page.dart';
import 'package:lightbite_app/features/customer/order/presentation/pages/order_confirmation_page.dart';
import 'package:lightbite_app/features/customer/order/presentation/pages/rate_order_page.dart';
import 'package:lightbite_app/features/customer/restaurant/presentation/pages/menu_item_detail_page.dart';
import 'package:lightbite_app/features/driver/profile/presentation/pages/profile_page.dart'
    as driver_profile;
import 'package:lightbite_app/l10n/app_localizations.dart';
import 'package:lightbite_app/pages/onboarding/onboarding_page.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

GoRouter createRouter() {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/onboarding',
    redirect: (context, state) {
      final authState = context.read<AuthCubit>().state;
      final isAuth = authState is AuthAuthenticated;
      final isLogin = state.matchedLocation == '/login';
      final isRegister = state.matchedLocation == '/register';
      final isOnboarding = state.matchedLocation == '/onboarding';

      // Allow onboarding, login, register without auth
      if (!isAuth && (isOnboarding || isLogin || isRegister)) return null;
      if (!isAuth) return '/onboarding';

      if (isAuth && (isLogin || isRegister || isOnboarding)) {
        return authState.user.role == UserRole.driver
            ? '/driver/home'
            : '/customer/home';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),

      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),

      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),

      GoRoute(
        path: '/orders/:uuid/track',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => TrackingPage(
          order: state.extra as dynamic,
        ),
      ),

      GoRoute(
        path: '/order-confirmation',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => OrderConfirmationPage(
          order: state.extra as dynamic,
        ),
      ),

      GoRoute(
        path: '/menu-item',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          return BlocProvider<CartCubit>.value(
            value: sl<CartCubit>(),
            child: MenuItemDetailPage(
              item: extra['item'] as dynamic,
              restaurantName: extra['restaurantName'] as String,
            ),
          );
        },
      ),

      GoRoute(
        path: '/search',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => BlocProvider<HomeCubit>(
          create: (_) => sl<HomeCubit>(),
          child: const SearchPage(),
        ),
      ),

      GoRoute(
        path: '/rate-order',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => RateOrderPage(
          order: state.extra as dynamic,
        ),
      ),

      GoRoute(
        path: '/pick-location',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final extra = state.extra as Map<String, double>?;
          return LocationPickerPage(
            initialLat: extra?['lat'],
            initialLng: extra?['lng'],
          );
        },
      ),

      GoRoute(
        path: '/addresses',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => BlocProvider(
          create: (_) => sl<AddressCubit>()..loadAddresses(),
          child: const AddressPage(),
        ),
      ),

      GoRoute(
        path: '/checkout',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => MultiBlocProvider(
          providers: [
            BlocProvider(create: (_) => sl<CheckoutCubit>()..loadAddresses()),
            BlocProvider<CartCubit>.value(value: sl<CartCubit>()),
            BlocProvider<OrderCubit>.value(value: sl<OrderCubit>()),
          ],
          child: const CheckoutPage(),
        ),
      ),

      GoRoute(
        path: '/restaurants/:uuid',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => MultiBlocProvider(
          providers: [
            BlocProvider(create: (_) => sl<MenuCubit>()..loadMenu(state.pathParameters['uuid']!)),
            BlocProvider<CartCubit>.value(value: sl<CartCubit>()),
          ],
          child: RestaurantDetailPage(
            restaurantUuid: state.pathParameters['uuid']!,
            restaurantName: state.extra as String? ?? '',
          ),
        ),
      ),

      // ── Customer tabs ──
      StatefulShellRoute.indexedStack(
        pageBuilder: (context, state, navigationShell) => NoTransitionPage(
          child: _CustomerShell(navigationShell: navigationShell),
        ),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/customer/home',
              builder: (context, state) => BlocProvider<HomeCubit>(
                create: (_) => sl<HomeCubit>(),
                child: const HomePage(),
              ),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/customer/cart',
              builder: (context, state) => BlocProvider<CartCubit>.value(
                value: sl<CartCubit>(),
                child: const CartPage(),
              ),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/customer/orders',
              builder: (context, state) => BlocProvider<OrderCubit>(
                create: (_) => sl<OrderCubit>(),
                child: const OrderHistoryPage(),
              ),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/customer/profile',
              builder: (context, state) => const CustomerProfilePage(),
            ),
          ]),
        ],
      ),

      // ── Driver tabs ──
      StatefulShellRoute.indexedStack(
        pageBuilder: (context, state, navigationShell) => NoTransitionPage(
          child: _DriverShell(navigationShell: navigationShell),
        ),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/driver/home',
              builder: (context, state) => BlocProvider<DriverCubit>(
                create: (_) => sl<DriverCubit>(),
                child: const DriverHomePage(),
              ),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/driver/earnings',
              builder: (context, state) => BlocProvider<DriverCubit>.value(
                value: sl<DriverCubit>(),
                child: const DriverEarningsPage(),
              ),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/driver/history',
              builder: (context, state) => BlocProvider<DriverCubit>.value(
                value: sl<DriverCubit>(),
                child: const DriverHistoryPage(),
              ),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/driver/profile',
              builder: (context, state) => const driver_profile.DriverProfilePage(),
            ),
          ]),
        ],
      ),
    ],
  );
}

class _CustomerShell extends StatelessWidget {
  const _CustomerShell({required this.navigationShell});
  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      body: navigationShell,
      floatingActionButton: navigationShell.currentIndex == 0
          ? FloatingActionButton.small(
              onPressed: () => context.push('/search'),
              child: const Icon(Icons.search),
            )
          : null,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home),
            label: l10n.home,
          ),
          NavigationDestination(
            icon: const Icon(Icons.shopping_cart_outlined),
            selectedIcon: const Icon(Icons.shopping_cart),
            label: l10n.cart,
          ),
          NavigationDestination(
            icon: const Icon(Icons.receipt_long_outlined),
            selectedIcon: const Icon(Icons.receipt_long),
            label: l10n.orders,
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline),
            selectedIcon: const Icon(Icons.person),
            label: l10n.profile,
          ),
        ],
      ),
    );
  }
}

class _DriverShell extends StatelessWidget {
  const _DriverShell({required this.navigationShell});
  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home),
            label: l10n.home,
          ),
          NavigationDestination(
            icon: const Icon(Icons.trending_up),
            label: l10n.earnings,
          ),
          NavigationDestination(
            icon: const Icon(Icons.history),
            label: l10n.history,
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline),
            selectedIcon: const Icon(Icons.person),
            label: l10n.profile,
          ),
        ],
      ),
    );
  }
}
