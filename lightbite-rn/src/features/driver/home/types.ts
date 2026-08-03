export interface DriverJobRestaurant {
  name: string;
  address: string;
}

export interface DriverJob {
  uuid: string;
  restaurant: DriverJobRestaurant;
  customer_area: string;
  earnings: string;
  distance_km: number;
  restaurant_lat: number;
  restaurant_lng: number;
  customer_lat: number;
  customer_lng: number;
}

export type DeliveryPhase = 'pickup' | 'picked_up' | 'delivering';

export interface ActiveDelivery {
  job: DriverJob;
  phase: DeliveryPhase;
}

export interface OnlineStatus {
  is_online: boolean;
}
