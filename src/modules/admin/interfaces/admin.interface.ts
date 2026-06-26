import { VerificationStatus } from "@prisma/client";

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

//to activate and deactivate user
export interface IUpdateUserStatus {
    isActive: boolean;
    reason: string; // reason is mandatory acc to frd
}

//assign role
export interface IAssignRole {
    roleId: string;
}

// export interface IBranchApproval {
//     branchId: string;

//     restaurantName: string;

//     branchName: string;

//     city: string;

//     ownerName: string;

//     ownerEmail: string;

//     ownerMobile: string;

//     verificationStatus: VerificationStatus;

//     createdAt: Date;
// }

// export interface IBranchApprovalList {
//     branches: IBranchApproval[];

//     pagination: {
//         page: number;
//         limit: number;
//         total: number;
//     };
// }