// types/cart.types.ts

export interface CartModifier {
  modifierName: string;
  extraPrice: number;
}

export interface AddToCartDTO {
  menuItemId: string;
  quantity: number;
  modifiers?: CartModifier[];
  specialInstruction?: string;
}