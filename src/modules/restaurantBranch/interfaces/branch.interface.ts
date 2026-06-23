import { Prisma, DayOfWeek, OrderStatus } from "@prisma/client";

export interface ICreateRestaurantBranch {
  branchName: string;
  contactNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  fssaiLicense?: string;
  latitude?: number;
  longitude?: number;
  deliveryRadiusKm?: number;
  isPrimary?: boolean;
  operatingHours?: {
    dayOfWeek: DayOfWeek;
    openTime?: string | Date;
    closeTime?: string | Date;
    isClosed: boolean;
  }[];
}

export interface IRestaurantBranchResponse {
  id: string;
  restaurantId: string;
  branchName: string | null;
  contactNumber: string | null;
  city: string | null;
  state: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

export interface IBranchValidation {
  id: string;
  restaurantId: string;
  isDeleted: boolean;
}

export type VerificationStatus = string;



export interface IRestaurantBranchList {

    id:string;
    branchName:string | null;
    contactNumber:string | null;
    city:string | null;
    state:string | null;
    verificationStatus:VerificationStatus;
    isPrimary:boolean;
    isActive:boolean;
    createdAt:Date;
}

export interface IRestaurantBranchListResponse {
    branches:IRestaurantBranchList[];
    pagination:{
        total:number;
        page:number;
        limit:number;
        totalPages:number;
    };
}

export interface IBranchDetails {

    id:string;
    restaurantId:string;
    branchName:string | null;
    contactNumber:string | null;
    addressLine1:string | null;
    addressLine2:string | null;
    city:string | null;
    state:string | null;
    pincode:string | null;
    gstin:string | null;
    fssaiLicense:string | null;
    verificationStatus:VerificationStatus;
    latitude:Prisma.Decimal | null;
    longitude:Prisma.Decimal | null;
    deliveryRadiusKm:Prisma.Decimal | null;
    isPrimary:boolean;
    isActive:boolean;
    createdAt:Date;
    updatedAt:Date;
    restaurant:{
        id:string;
        name:string | null;
    };
    head:{
        id:string;

        user:{
            id:string;
            fullName:string;
            email:string;
            mobile:string;
        };
    } | null;
    operatingHours:IOperatingHour[];
}

export interface IOperatingHour {

    id:string;
    dayOfWeek:DayOfWeek;
    openTime:Date | null;
    closeTime:Date | null;
    isClosed:boolean;
}

//Update Restaurant Branch
export interface IUpdateRestaurantBranch {

    branchName?: string;
    contactNumber?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstin?: string;
    fssaiLicense?: string;
    latitude?: number;
    longitude?: number;
    deliveryRadiusKm?: number;
    isPrimary?: boolean;
}

export interface IBranchValidation {
    id:string;
    restaurantId:string;
    branchName:string | null;
    gstin:string | null;
    fssaiLicense:string | null;
    verificationStatus:VerificationStatus;
    isPrimary:boolean;
    isDeleted:boolean;
}

export interface IUpdatedBranchResponse {
    id:string;
    branchName:string | null;
    city:string | null;
    state:string | null;
    verificationStatus:VerificationStatus;
    isPrimary:boolean;
    isActive:boolean;
    updatedAt:Date;
}

export interface IUpdateBranchStatus {
    isActive:boolean;
}

export interface IBranchStatusResponse {
    id:string;
    branchName:string | null;
    isActive:boolean;
    updatedAt:Date;
}


export interface IDeleteBranchResponse {
    id:string;
    branchName:string | null;
    isDeleted:boolean;
    deletedAt:Date | null;
}

export interface IBranchAccessValidation {
    id:string;
    isDeleted:boolean;
    restaurant:{
        ownerId:string;
    };
    staff:{
        userId:string;
    }[];
}

export interface IBranchOrder {
    id:string;
    orderNumber:string;
    status:OrderStatus;
    totalAmount:Prisma.Decimal;
    placedAt:Date;
    customer:{
        id:string;
        fullName:string;
    };
}

export interface IBranchOrder {
    id:string;
    orderNumber:string;
    status:OrderStatus;
    totalAmount:Prisma.Decimal;
    placedAt:Date;
    customer:{
        id:string;
        fullName:string;
    };
}

export interface IBranchOrdersResponse {
    orders:IBranchOrder[];
    pagination:{
        total:number;
        page:number;
        limit:number;
        totalPages:number;
    };

}