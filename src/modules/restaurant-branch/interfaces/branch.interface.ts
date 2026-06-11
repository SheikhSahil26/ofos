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
