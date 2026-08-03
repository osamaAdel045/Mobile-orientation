export type DriverOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export interface DriverOrder {
  uuid: string;
  order_number: string;
  restaurant: { name: string };
  earnings: string;
  distance_km: number;
  status: DriverOrderStatus;
  completed_at: string;
}
