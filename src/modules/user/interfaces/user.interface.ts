export interface IExistUser{
    id: string;
    email: string;
    isDeleted: boolean;
}

export interface IUpdateUser{
    fullName?: string;
    mobile?: string;
    profilePhoto?: string | null;
}

export interface IUser{
    id: string;
    fullName: string;
    email: string;
    mobile: string;
    profilePhoto?: string | null;
    isVerified: boolean;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IDashboard {
    id: string;
    totalOrders: number;
    savedAddresses: number;
    loyaltyPoints: number;
    totalReviews: number;
    recentRestaurants: IRecentRestaurant[];
    currentOrder: ICurrentOrder;
}

export interface IRecentRestaurant {
    restaurantId: string | null;
    restaurantName: string | null;
    logoUrl: string | null;
    branchId: string | null;
    branchName: string | null;
    placedAt: Date | null;
}

export interface ICurrentOrder {
    id: string | null;
    orderNumber: string | null;
    status: string | null;
    placedAt: Date | null;
}