import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import { apiClient } from '@/core/api/client';
import { AppError, mapApiError } from '@/core/api/types';

import { restaurantListResponseSchema } from '../schemas/home.schema';
import type { Restaurant, SortOption } from '../types';

const DEFAULT_LAT = 25.0801;
const DEFAULT_LNG = 55.14;

interface FetchRestaurantsParams {
  lat?: number;
  lng?: number;
  radius?: number;
  cuisine?: string[];
  query?: string;
  sort?: SortOption;
  page?: number;
}

export async function fetchRestaurants(
  params: FetchRestaurantsParams = {},
): Promise<Result<{ restaurants: Restaurant[]; total: number; hasMore: boolean }, AppError>> {
  try {
    const response = await apiClient.get('/restaurants', {
      params: {
        lat: params.lat ?? DEFAULT_LAT,
        lng: params.lng ?? DEFAULT_LNG,
        radius: params.radius ?? 10,
        cuisine: params.cuisine?.join(','),
        q: params.query || undefined,
        sort: params.sort ?? 'distance',
        page: params.page ?? 1,
        per_page: 20,
      },
    });

    const parsed = restaurantListResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      return err({ code: 'PARSE_ERROR', message: 'Invalid response format', statusCode: 0 });
    }

    const { data, meta } = parsed.data;
    const total = meta?.total ?? data.length;
    const hasMore = meta ? meta.current_page * meta.per_page < total : false;

    return ok({ restaurants: data, total, hasMore });
  } catch (error) {
    return err(mapApiError(error));
  }
}
