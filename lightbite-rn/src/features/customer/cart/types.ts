export interface CartRestaurant {
  uuid: string;
  name: string;
}

export interface CartMenuItem {
  uuid: string;
  name: string;
}

export interface CartItem {
  id: number;
  menu_item: CartMenuItem;
  quantity: number;
  unit_price: string;
  subtotal: string;
  special_instructions: string | null;
}

export interface Cart {
  uuid: string;
  restaurant: CartRestaurant;
  items: CartItem[];
  subtotal: string;
  delivery_fee: string;
  tax: string;
  total: string;
  expires_at: string;
}

export interface AddToCartRequest {
  menu_item_uuid: string;
  quantity: number;
  special_instructions?: string;
}
