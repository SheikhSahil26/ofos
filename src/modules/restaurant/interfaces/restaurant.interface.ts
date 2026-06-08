export interface IExistingRestaurant {
    id: string;
    ownerId: string;
    name: string | null;
    isActive: boolean;
    isDeleted: boolean;
}

export interface IRestaurantFilters {
    page?: number;
    limit?: number;
    search?: string;
}

export interface INearbyRestaurantFilters {
    latitude: number;
    longitude: number;
    radius: number;
}

export interface IRestaurantPagination {
    page: number;
    limit: number;
    total: number;
}

export interface IBranch {
    id?: string;
    latitude: string | number;
    longitude: string | number;
    [key: string]: any;
}

export interface IRestaurantsResult {
    restaurants: any[];
    total: number;
}

export interface IPagination {
    page: number;
    limit: number;
    total: number;
}

export interface INearbyItem {
    branch: IBranch;
    distance: number;
}

export interface IRestaurantValidation {
    id: string;
    ownerId: string;
    isActive: boolean;
    isDeleted: boolean;
}