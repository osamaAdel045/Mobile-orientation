import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:lightbite_app/core/theme/extensions/lightbite_theme.dart';
import 'package:lightbite_app/features/customer/home/presentation/cubit/home_cubit.dart';
import 'package:lightbite_app/features/customer/home/presentation/cubit/home_state.dart';
import 'package:lightbite_app/features/customer/home/domain/entities/restaurant.dart';
import 'package:lightbite_app/core/widgets/lb_shimmer.dart';

/// Full-screen restaurant search with auto-focus and recent searches.
///
/// Design spec §8.1 #4: Auto-focus search input, recent searches,
/// results showing restaurants.
class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final _controller = TextEditingController();
  final _recentSearches = ValueNotifier<List<String>>([]);

  @override
  void dispose() {
    _controller.dispose();
    _recentSearches.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = LightBiteTheme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _controller,
          autofocus: true,
          onChanged: (v) {
            if (v.length >= 2) {
              context.read<HomeCubit>().search(v);
            }
          },
          onSubmitted: (v) {
            if (v.isNotEmpty) {
              final updated = [v, ..._recentSearches.value];
              _recentSearches.value = updated.take(10).toList();
              context.read<HomeCubit>().search(v);
            }
          },
          decoration: InputDecoration(
            hintText: 'Search restaurants or dishes...',
            hintStyle: TextStyle(color: theme.colors.neutral400),
            border: InputBorder.none,
            filled: true,
            fillColor: theme.colors.neutral100,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            prefixIcon: Icon(Icons.search, color: theme.colors.neutral400),
            suffixIcon: _controller.text.isNotEmpty
                ? IconButton(
                    icon: Icon(Icons.clear, color: theme.colors.neutral400),
                    onPressed: () {
                      _controller.clear();
                      context.read<HomeCubit>().filterByCuisine('All');
                    },
                  )
                : null,
          ),
        ),
      ),
      body: BlocBuilder<HomeCubit, HomeState>(
        builder: (context, state) {
          final hasQuery = _controller.text.length >= 2;

          return switch (state) {
            HomeInitial() || HomeLoading() when hasQuery =>
              _buildShimmer(),
            HomeLoaded(:final restaurants, :final allRestaurants) when hasQuery =>
              restaurants.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.search_off_rounded,
                              size: 64, color: theme.colors.neutral200),
                          const SizedBox(height: 16),
                          Text('No results found',
                              style: theme.typography.titleMedium.copyWith(
                                  color: theme.colors.neutral400)),
                          const SizedBox(height: 4),
                          Text('Try a different search term',
                              style: theme.typography.bodyMedium.copyWith(
                                  color: theme.colors.neutral400)),
                        ],
                      ),
                    )
                  : _buildResults(context, restaurants),
            _ => ValueListenableBuilder<List<String>>(
                valueListenable: _recentSearches,
                builder: (context, recent, _) {
                  if (recent.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.search_rounded,
                              size: 64, color: theme.colors.neutral200),
                          const SizedBox(height: 16),
                          Text('Search LightBite',
                              style: theme.typography.titleLarge.copyWith(
                                  color: theme.colors.neutral700)),
                          const SizedBox(height: 4),
                          Text('Find restaurants and dishes near you',
                              style: theme.typography.bodyMedium.copyWith(
                                  color: theme.colors.neutral400)),
                        ],
                      ),
                    );
                  }
                  return _buildRecent(context, recent);
                },
              ),
          };
        },
      ),
    );
  }

  Widget _buildResults(BuildContext context, List<Restaurant> restaurants) {
    final theme = LightBiteTheme.of(context);
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: restaurants.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, i) {
        final r = restaurants[i];
        return Card(
          child: InkWell(
            onTap: () => context.push('/restaurants/${r.uuid}', extra: r.name),
            borderRadius: theme.radius.md,
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: theme.colors.primary100,
                      borderRadius: theme.radius.sm,
                    ),
                    child: Icon(Icons.restaurant,
                        color: theme.colors.primary500, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(r.name,
                            style: theme.typography.titleMedium.copyWith(
                                color: theme.colors.neutral900)),
                        const SizedBox(height: 4),
                        Text(
                          '${r.cuisineTypes.join(', ')} • ${r.distance.toStringAsFixed(1)} km • ${r.prepAvgTimeMin} min',
                          style: theme.typography.bodyMedium.copyWith(
                              color: theme.colors.neutral400),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(Icons.chevron_right, color: theme.colors.neutral400),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildRecent(BuildContext context, List<String> recent) {
    final theme = LightBiteTheme.of(context);
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Recent Searches',
                  style: theme.typography.titleMedium.copyWith(
                      color: theme.colors.neutral900)),
              TextButton(
                onPressed: () => _recentSearches.value = [],
                child: Text('Clear All',
                    style: TextStyle(color: theme.colors.primary500,
                        fontSize: 13)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: recent.map((q) => ActionChip(
              label: Text(q),
              avatar: Icon(Icons.history, size: 16,
                  color: theme.colors.neutral400),
              onPressed: () {
                _controller.text = q;
                context.read<HomeCubit>().search(q);
              },
            )).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (_, __) => const Padding(
        padding: EdgeInsets.only(bottom: 12),
        child: LBShimmerCard(),
      ),
    );
  }
}
