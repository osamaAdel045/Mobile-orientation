import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/config/app_environment.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/widgets/lb_shimmer.dart';
import '../../../../../core/widgets/lb_error_widget.dart';
import '../../../../../l10n/app_localizations.dart';
import '../../../home/domain/entities/restaurant.dart';
import '../cubit/home_cubit.dart';
import '../cubit/home_state.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HomeCubit>().loadRestaurants(
            AppEnvironmentConfig.defaultLat,
            AppEnvironmentConfig.defaultLng,
          );
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.deliverTo,
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: AppColors.neutral400)),
            const Text(
              'Dubai Marina',
              style: TextStyle(fontSize: 16),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: BlocBuilder<HomeCubit, HomeState>(
        builder: (context, state) {
          return state.when(
            initial: () => const SizedBox.shrink(),
            loading: () => _buildShimmer(),
            loaded: (restaurants, _all, cuisines, selectedCuisine) =>
                _buildContent(restaurants, cuisines, selectedCuisine),
            error: (message) => LBErrorWidget(
              message: message,
              onRetry: () => context.read<HomeCubit>().loadRestaurants(
                    AppEnvironmentConfig.defaultLat,
                    AppEnvironmentConfig.defaultLng,
                  ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: 4,
      itemBuilder: (_, __) => const Padding(
        padding: EdgeInsets.only(bottom: AppSpacing.md),
        child: LBShimmerCard(),
      ),
    );
  }

  Widget _buildContent(
    List<Restaurant> restaurants,
    List<String> cuisines,
    String? selectedCuisine,
  ) {
    return RefreshIndicator(
      onRefresh: () => context.read<HomeCubit>().loadRestaurants(
            AppEnvironmentConfig.defaultLat,
            AppEnvironmentConfig.defaultLng,
          ),
      child: CustomScrollView(
        slivers: [
          // Search bar
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md, vertical: AppSpacing.sm),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: AppLocalizations.of(context)!.searchPlaceholder,
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: AppColors.neutral100,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
                    borderSide: BorderSide.none,
                  ),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchController.clear();
                            context.read<HomeCubit>().loadRestaurants(
                                  AppEnvironmentConfig.defaultLat,
                                  AppEnvironmentConfig.defaultLng,
                                );
                          },
                        )
                      : null,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md, vertical: 12),
                ),
                onChanged: (value) {
                  if (value.length >= 2) {
                    context.read<HomeCubit>().search(value);
                  } else if (value.isEmpty) {
                    context.read<HomeCubit>().loadRestaurants(
                          AppEnvironmentConfig.defaultLat,
                          AppEnvironmentConfig.defaultLng,
                        );
                  }
                },
              ),
            ),
          ),

          // Cuisine chips
          SliverToBoxAdapter(
            child: SizedBox(
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding:
                    const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                itemCount: cuisines.length,
                separatorBuilder: (_, __) =>
                    const SizedBox(width: AppSpacing.sm),
                itemBuilder: (context, index) {
                  final c = cuisines[index];
                  final selected = c == (selectedCuisine ?? 'All');
                  return FilterChip(
                    label: Text(c),
                    selected: selected,
                    onSelected: (_) =>
                        context.read<HomeCubit>().filterByCuisine(c),
                  );
                },
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.sm)),

          // Restaurant count
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Text(
                AppLocalizations.of(context)!.restaurantsNearYou(restaurants.length),
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: AppColors.neutral400),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.sm)),

          // Restaurant list
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            sliver: SliverList.separated(
              itemCount: restaurants.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, index) {
                final r = restaurants[index];
                return _RestaurantCard(restaurant: r);
              },
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xl)),
        ],
      ),
    );
  }
}

class _RestaurantCard extends StatelessWidget {
  const _RestaurantCard({required this.restaurant});

  final Restaurant restaurant;

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push(
          '/restaurants/${restaurant.uuid}',
          extra: restaurant.name,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cover image
            SizedBox(
              height: 160,
              width: double.infinity,
              child: restaurant.coverUrl != null
                  ? CachedNetworkImage(
                      imageUrl: restaurant.coverUrl!,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(
                        color: AppColors.neutral100,
                      ),
                      errorWidget: (_, __, ___) => const Center(
                        child: Icon(Icons.restaurant,
                            size: 48, color: AppColors.neutral300),
                      ),
                    )
                  : Container(
                      color: AppColors.neutral100,
                      child: const Center(
                        child: Icon(Icons.restaurant,
                            size: 48, color: AppColors.neutral300),
                      ),
                    ),
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          restaurant.name,
                          style: Theme.of(context).textTheme.titleLarge,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Row(
                        children: [
                          const Icon(Icons.star,
                              size: 16, color: AppColors.warning),
                          const SizedBox(width: 4),
                          Text(
                            restaurant.rating.toStringAsFixed(1),
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    restaurant.cuisineTypes.join(', '),
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: AppColors.neutral400),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.access_time,
                          size: 14, color: AppColors.neutral400),
                      const SizedBox(width: 4),
                      Text(
                        restaurant.deliveryTimeDisplay,
                        style: Theme.of(context)
                            .textTheme
                            .bodySmall
                            ?.copyWith(color: AppColors.neutral500),
                      ),
                      const Spacer(),
                      Text(
                        'AED 5.00 delivery',
                        style: Theme.of(context)
                            .textTheme
                            .bodySmall
                            ?.copyWith(color: AppColors.neutral500),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

