export type AddressLabel = 'home' | 'work' | 'other';

export interface Address {
  uuid: string;
  label: AddressLabel;
  address: string;
  apartment: string | null;
  lat: number;
  lng: number;
  is_default: boolean;
}

export interface AddressRequest {
  label: AddressLabel;
  address: string;
  apartment?: string;
  lat: number;
  lng: number;
  is_default: boolean;
}
