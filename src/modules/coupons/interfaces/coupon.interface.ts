import { CouponType } from "@prisma/client";

export interface ICreateCoupon {
    code: string;
    type: CouponType;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    startDate?: Date;
    endDate?: Date;
    usageLimit?: number;
    isActive?: boolean;
}

export interface IUpdateCoupon {
    code?: string;
    type?: CouponType;
    discountValue?: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    startDate?: Date;
    endDate?: Date;
    usageLimit?: number;
    isActive?: boolean;
}

export interface IUpdateCouponStatus {
    isActive: boolean;
}

export interface IValidateCoupon {
  couponCode: string;
  orderAmount: number; // assuming delivery fee is included
  deliveryFee: number;
}

export interface IValidateCouponResponse {
    couponId: string;
    couponCode: string;
    couponType: string;
    discount: number;
    finalAmount: number;
    freeDelivery: boolean;
}

export interface ICouponUsageStats {
    couponId: string;
    couponCode: string;
    usageLimit: number | null;
    totalUsageCount: number;
    uniqueCustomers: number;
    remainingUsage: number | null;
    totalRevenueGenerated: number;
    totalDiscountGiven: number;

    recentUsages: {
        orderId: string;
        customerName: string;
        usedAt: Date | null;
    }[];
}

export interface IGetCouponsFilters {
    code?: string | undefined;
    type?: CouponType | undefined;
    isActive?: boolean | undefined;
    isDeleted?: boolean | undefined;
}