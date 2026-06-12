// modules/delivery/types/delivery.types.ts

export interface UpdateLocationInput {
  deliveryUserId: string;
  lat: number;
  lng: number;
}

export interface AssignPartnerInput {
  orderId: string;
}

export interface PartnerWithDistance {
  partnerId: string;
  userId: string;
  distance: number;
}