import { Prisma, PromotionType } from "@prisma/client";

export interface ICreatePromotion {
    title:string;
    code?:string;
    type:PromotionType;
    discountValue?:number;
    minimumOrderAmount?:number;
    maximumDiscountAmount?:number;
    startDate:string;
    endDate:string;
    menuItemIds?:string[];
}

export interface ICreatedPromotion {
    id:string;
    restaurantId:string;
    title:string;
    code:string | null;
    type:PromotionType;
    discountValue:Prisma.Decimal | null;
    minimumOrderAmount:Prisma.Decimal | null;
    maximumDiscountAmount:Prisma.Decimal | null;
    startDate:Date;
    endDate:Date;
    isActive:boolean;
}

export interface IPromotionValidation {
    id:string;
    restaurantId:string;
    isDeleted:boolean;
    isActive:boolean;
}

export interface IDeletePromotionResponse {
    id:string;
    title:string;
    code:string | null;
    isDeleted:boolean;
    deletedAt:Date | null;
}

export interface IRestaurantPromotion {
    id:string;
    title:string;
    code:string | null;
    type:PromotionType;
    discountValue:Prisma.Decimal | null;
    minimumOrderAmount:Prisma.Decimal | null;
    maximumDiscountAmount:Prisma.Decimal | null;
    startDate:Date;
    endDate:Date;
}

export interface IRestaurantPromotionsResponse {
    promotions:
    IRestaurantPromotion[];
}