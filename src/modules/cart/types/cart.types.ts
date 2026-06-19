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
  restaurantBranchId: string |null;
  items: EnrichedCartItem[] | [];
  subtotal: number;
}

// modules/cart/types/cart.types.ts

export interface CheckoutDetails {
  cart: EnrichedCart;
  addresses: AddressSummary[];
  defaultAddressId: string | null;
  availableCoupons: CouponSummary[];
}

export interface AddressSummary {
  id: string;
  label: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isDefault: boolean;
}

export interface CouponSummary {
  id: string;
  code: string;
  type: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  isEligible: boolean;        // true if cart subtotal meets minOrderAmount
  reasonIfNotEligible?: string;
}