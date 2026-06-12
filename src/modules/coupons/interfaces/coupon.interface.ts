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
  orderAmount: number;
}