export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export interface OrderItem {
  name: string;
  quantity: number;
  unit_price: string;
}

export interface Order {
  uuid: string;
  order_number: string;
  status: OrderStatus;
  restaurant: { name: string; uuid: string };
  items: OrderItem[];
  subtotal: string;
  total: string;
  created_at: string;
}

export interface DriverInfo {
  name: string;
  photo_url: string;
  rating: number;
  lat: number;
  lng: number;
  bearing: number;
  eta_min: number;
}

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
}

export interface OrderTracking {
  uuid: string;
  status: OrderStatus;
  status_history: StatusHistoryEntry[];
  driver: DriverInfo | null;
  estimated_delivery_at: string | null;
}
