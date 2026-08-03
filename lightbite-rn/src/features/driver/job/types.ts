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
