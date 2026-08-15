// DriverProfile feature types

export interface DriverVehicle {
  type: string;
  plate_number: string | null;
}

export interface DriverProfileSummary {
  /** Completed deliveries (from `GET /driver/orders` meta.total). */
  total_trips: number;
  /** Average rating — only present when the auth payload surfaces one. */
  rating: number | null;
  /** Vehicle info — only present when the auth payload surfaces one. */
  vehicle: DriverVehicle | null;
}
