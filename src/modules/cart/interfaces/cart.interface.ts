export interface CartItem {
    menuItemId: string;
    quantity: number;
    unitPrice: number;
     modifiers: CartModifier[];
     specialInstruction: string;
}

export interface Cart {
    userId: string;
    restaurantBranchId: string;
    items: CartItem[];
    subtotal: number;
}

export interface CartModifier {
  modifierName: string;
  extraPrice: number;
}