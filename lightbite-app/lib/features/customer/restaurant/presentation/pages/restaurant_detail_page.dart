import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/widgets/lb_error_widget.dart';
import '../../../../../core/widgets/lb_shimmer.dart';
import '../../../../../l10n/app_localizations.dart';
import '../../../cart/presentation/cubit/cart_cubit.dart';
import '../../domain/entities/menu_item.dart';
import '../../domain/entities/restaurant_menu.dart';
import '../cubit/menu_cubit.dart';
import '../cubit/menu_state.dart';

class RestaurantDetailPage extends StatefulWidget {
  const RestaurantDetailPage({
    super.key,
    required this.restaurantUuid,
    required this.restaurantName,
  });

  final String restaurantUuid;
  final String restaurantName;

  @override
  State<RestaurantDetailPage> createState() => _RestaurantDetailPageState();
}

class _RestaurantDetailPageState extends State<RestaurantDetailPage> {
  String? _selectedCategory;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MenuCubit>().loadMenu(widget.restaurantUuid);
    });
  }

  @override
  Widget build(BuildContext context) {
    final restaurantName = widget.restaurantName;
    return Scaffold(
      appBar: AppBar(
        title: Text(restaurantName),
      ),
      body: BlocBuilder<MenuCubit, MenuState>(
        builder: (context, state) {
          return switch (state) {
            MenuInitial() => const SizedBox.shrink(),
            MenuLoading() => _buildShimmer(),
            MenuError(:final message) => LBErrorWidget(
                message: message,
                onRetry: () =>
                    context.read<MenuCubit>().loadMenu(widget.restaurantUuid),
              ),
            MenuLoaded(:final menu) => _buildContent(menu),
          };
        },
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: 5,
      itemBuilder: (_, __) => const Padding(
        padding: EdgeInsets.only(bottom: AppSpacing.md),
        child: LBShimmerCard(),
      ),
    );
  }

  Widget _buildContent(RestaurantMenu menu) {
    final categories = menu.categories;
    if (categories.isEmpty) {
      return const Center(
        child: Text('No menu items available',
            style: TextStyle(color: AppColors.neutral400)),
      );
    }

    // Default to first category
    final effectiveCategory =
        _selectedCategory ?? categories.first.name;

    final activeCategory = categories.firstWhere(
      (c) => c.name == effectiveCategory,
      orElse: () => categories.first,
    );
    final items = activeCategory.items;

    return Column(
      children: [
        // Category tabs
        SizedBox(
          height: 48,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            itemCount: categories.length,
            separatorBuilder: (_, __) =>
                const SizedBox(width: AppSpacing.sm),
            itemBuilder: (context, index) {
              final cat = categories[index];
              final name = cat.name;
              final selected = name == effectiveCategory;
              return FilterChip(
                label: Text(name),
                selected: selected,
                onSelected: (_) => setState(() => _selectedCategory = name),
                selectedColor: AppColors.primary100,
                checkmarkColor: AppColors.primary500,
                labelStyle: TextStyle(
                  color: selected ? AppColors.primary700 : AppColors.neutral500,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                ),
              );
            },
          ),
        ),

        const Divider(height: 1),

        // Menu items
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.md),
            itemCount: items.length,
            separatorBuilder: (_, __) =>
                const SizedBox(height: AppSpacing.sm),
            itemBuilder: (context, index) {
              final item = items[index];
              return _MenuItemCard(
                item: item,
                restaurantUuid: widget.restaurantUuid,
                restaurantName: widget.restaurantName,
              );
            },
          ),
        ),
      ],
    );
  }
}

class _MenuItemCard extends StatelessWidget {
  const _MenuItemCard({
    required this.item,
    required this.restaurantUuid,
    required this.restaurantName,
  });

  final MenuItem item;
  final String restaurantUuid;
  final String restaurantName;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            ClipRRect(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              child: SizedBox(
                width: 80,
                height: 80,
                child: item.imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: item.imageUrl!,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Container(
                          color: AppColors.neutral100,
                        ),
                        errorWidget: (_, __, ___) => const Icon(
                          Icons.restaurant,
                          color: AppColors.neutral300,
                        ),
                      )
                    : Container(
                        color: AppColors.neutral100,
                        child: const Icon(Icons.restaurant,
                            color: AppColors.neutral300),
                      ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),

            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  if (item.description != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      item.description!,
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(color: AppColors.neutral400),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'AED ${item.price.toStringAsFixed(2)}',
                        style: Theme.of(context)
                            .textTheme
                            .bodyLarge
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      if (item.isAvailable)
                        FilledButton.icon(
                          onPressed: () {
                            context.push('/menu-item', extra: {
                              'item': item,
                              'restaurantName': restaurantName,
                            });
                          },
                          icon: const Icon(Icons.add, size: 18),
                          label: Text(l10n.addToCart),
                          style: FilledButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            minimumSize: Size.zero,
                            textStyle: const TextStyle(fontSize: 12),
                          ),
                        )
                      else
                        Text(
                          l10n.unavailable,
                          style: const TextStyle(
                            color: AppColors.error,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
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

  void _addToCart(BuildContext context) {
    try {
      context.read<CartCubit>().addItem(item.uuid, 1);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.addedToCart(item.name),
          ),
          action: SnackBarAction(
            label: AppLocalizations.of(context)!.viewCart,
            onPressed: () => context.go('/customer/cart'),
          ),
          duration: const Duration(seconds: 2),
        ),
      );
    } catch (e) {
      print('_MenuItemCard._addToCart $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to add item.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }
}
