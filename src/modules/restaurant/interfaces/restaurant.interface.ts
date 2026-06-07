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

export interface Branch {
    id?: string;
    latitude: string | number;
    longitude: string | number;
    [key: string]: any;
}

export interface RestaurantsResult {
    restaurants: any[];
    total: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
}

export interface NearbyItem {
    branch: Branch;
    distance: number;
}

export interface IRestaurantValidation {
    id: string;
    ownerId: string;
    isActive: boolean;
    isDeleted: boolean;
}