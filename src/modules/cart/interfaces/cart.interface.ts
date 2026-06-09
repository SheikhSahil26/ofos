export interface CartItem {
    menuItemId: string;
    quantity: number;
    unitPrice: number;
}

export interface Cart {
    userId: number;
    restaurantBranchId: string;
    items: CartItem[];
    subtotal: number;
}