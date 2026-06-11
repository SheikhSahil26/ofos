// types/order.types.ts

import { OrderStatus } from "@prisma/client/wasm";

// Staff can only move through these transitions
export const STAFF_TRANSITIONS: Record<string, OrderStatus> = {
  PLACED: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY_FOR_PICKUP",
};

// Delivery partner can only move through these transitions
export const DELIVERY_TRANSITIONS: Record<string, OrderStatus> = {
  READY_FOR_PICKUP: "PICKED_UP",
  PICKED_UP: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};