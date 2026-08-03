export interface MenuItem {
  uuid: string;
  name: string;
  description: string;
  price: string;
  image_url: string | null;
  is_available: boolean;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface RestaurantDetail {
  uuid: string;
  name: string;
  description: string;
  logo_url: string | null;
  cover_url: string | null;
  cuisine_types: string[];
  rating?: number;
  review_count?: number;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  is_open: boolean;
  hours: {
    today: { open: string; close: string }[];
    is_open: boolean;
  } | null;
  delivery_fee: string;
  min_order?: string;
  delivery_time_min: number;
  categories: MenuCategory[];
}
