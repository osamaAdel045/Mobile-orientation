export interface Restaurant {
  uuid: string;
  name: string;
  logo_url: string | null;
  cuisine_types: string[];
  rating?: number;
  review_count?: number;
  delivery_time_min: number;
  delivery_fee: string;
  distance_km: number;
  is_open: boolean;
  is_accepting_orders?: boolean;
}

export type SortOption = 'distance' | 'rating' | 'delivery_time';

export interface HomeFilters {
  query: string;
  cuisine: string[];
  sort: SortOption;
}
