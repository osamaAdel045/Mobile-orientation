export type PaymentMethod = 'cash_on_delivery' | 'card';

export interface OrderResult {
  uuid: string;
  order_number: string;
  status: string;
  restaurant: { name: string };
  subtotal: string;
  delivery_fee: string;
  tax: string;
  total: string;
  estimated_delivery_min: number;
  created_at: string;
}

export interface PlaceOrderRequest {
  restaurant_uuid: string;
  delivery_address_uuid: string;
  payment_method: PaymentMethod;
  customer_note?: string;
}
