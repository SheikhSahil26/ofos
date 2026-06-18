export interface Order {
    id: string;
    orderNumber: string;

    customerId: string;
    branchId: string;
    addressId: string;
    couponId?: string | null;

    subtotal: number;
    taxAmount: number;
    deliveryFee: number;
    discountAmount: number;
    totalAmount: number;

    status: string;
    paymentStatus: string;

    scheduledAt?: Date | null;
    placedAt: Date;
    deliveredAt?: Date | null;
}

export interface OrderItem {
    id: string;

    orderId: string;

    menuItemId?: string | null;

    menuItemName: string;

    price: number;

    quantity: number;

    // specialInstruction?: string | null;

    modifiers: OrderItemModifier[];
}

export interface OrderItemModifier {
    id?: string;

    orderItemId?: string;

    modifierName: string;

    extraPrice: number;
}

export interface OrderStatusHistory {
    id: string;

    orderId: string;

    oldStatus?: string | null;

    newStatus?: string | null;

    changedBy?: string | null;

    changedAt?: Date | null;
}

export enum PaymentMethod {
    COD = "COD",
    UPI = "UPI",
    CARD = "CARD",
    NET_BANKING = "NET_BANKING",
    WALLET = "WALLET",
}

export interface CreateOrderInput {
    userId: string;

    addressId: string;

    paymentMethod: PaymentMethod;

    couponCode?: string;

    scheduledAt?: Date;
}
export interface OrderItemInput {
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    menuItemName: string;
    modifiers: OrderItemModifier[];
    specialInstruction?: string;
}