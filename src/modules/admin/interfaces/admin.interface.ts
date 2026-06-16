import { UserAddress } from "@prisma/client";

//get user details
export interface IUserAddressResponse {
  id: string;
  label: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isDefault: boolean;
}

export interface IUserDetailsResponse {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  profilePhoto: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  roles: string[];
  addresses: IUserAddressResponse[];
}

//customer details
export interface ICustomerDetailsResponse {
    id: string;
    fullName: string;
    email: string;
    mobile: string;
    profilePhoto: string | null;

    isVerified: boolean;
    isActive: boolean;

    loyaltyPoints: number;

    totalOrders: number;
    totalSpent: number;

    couponsUsed: number;

    addressesCount: number;

    createdAt: Date;
}

//restaurant owner details
export interface IRestaurantSummary {
    id: string;
    name: string | null;
    isActive: boolean;
    totalBranches: number;
}

export interface IRestaurantOwnerDetailsResponse {
    id: string;
    fullName: string;
    email: string;
    mobile: string;
    isVerified: boolean;
    isActive: boolean;

    totalRestaurants: number;
    totalBranches: number;

    restaurants: IRestaurantSummary[];

    createdAt: Date;
}