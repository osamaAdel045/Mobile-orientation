export interface RateOrderRequest {
  rating: number;
  review?: string;
}

export interface Rating {
  uuid: string;
  order_uuid: string;
  rating: number;
  review?: string;
  created_at?: string;
}
