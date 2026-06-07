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