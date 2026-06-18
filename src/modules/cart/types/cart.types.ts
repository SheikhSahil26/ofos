// modules/cart/types/cart.types.ts

import { CartModifier } from "../interfaces/cart.interface";

export interface EnrichedCartItem {
  menuItemId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isVeg: boolean;
  quantity: number;
  unitPrice: number;
  modifiers: CartModifier[];
  specialInstruction?: string;
  itemTotal: number;
}

export interface EnrichedCart {
  userId: string;
  restaurantBranchId: string;
  items: EnrichedCartItem[];
  subtotal: number;
}