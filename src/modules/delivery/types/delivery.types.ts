// modules/delivery/types/delivery.types.ts

import { DeliveryStatus, VehicleType } from "@prisma/client";

export interface UpdateLocationInputs {
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

// modules/delivery/types/delivery.types.ts

export interface ToggleAvailabilityInput {
  deliveryUserId: string;
}

export interface ToggleAvailabilityResult {
  partnerId: string;
  previousStatus: string;
  currentStatus: string;
}

// modules/delivery/types/delivery.types.ts

export interface UpdateDeliveryPartnerProfileInput {
  deliveryUserId: string;
  vehicleType?: VehicleType;
  vehicleNumber?: string;
  governmentId?: string;
}

// modules/delivery/types/delivery.types.ts

export interface GetEarningsInput {
  deliveryUserId: string;
  period?: "today" | "week" | "month" | "all";
}

export interface EarningsSummary {
  period: string;
  totalDeliveries: number;
  totalEarnings: number;
  averageEarningPerDelivery: number;
  totalRejected: number;
  totalAccepted: number;
  acceptanceRate: string;
  recentDeliveries: any[];
}

// modules/delivery/types/delivery.types.ts

export interface GetDeliveryHistoryInput {
  deliveryUserId: string;
  status?: DeliveryStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// modules/delivery/types/delivery.types.ts

export interface GetPartnerRatingsInput {
  deliveryUserId: string;
  page?: number;
  limit?: number;
}