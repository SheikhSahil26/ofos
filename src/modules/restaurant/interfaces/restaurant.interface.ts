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

// restaurant.interface.ts

export interface IRestaurantValidation {
  id: string;
  ownerId: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface IOperatingHourInput {
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

  openTime: Date;
  closeTime: Date;
  isClosed?: boolean;
}

export interface ICreateRestaurant {
  name: string;
  description?: string;

  logoUrl?: string;
  coverImageUrl?: string;

  branchName: string;

  addressLine1: string;
  addressLine2?: string;

  city: string;
  state: string;
  pincode: string;

  contactNumber: string;

  gstin: string;
  fssaiLicense: string;

  latitude: number;
  longitude: number;

  deliveryRadiusKm: number;

  operatingHours: IOperatingHourInput[];
}

export interface IUpdateRestaurant {
  // restaurant table
  name?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  isActive?: boolean;

  // primary branch table
  branchName?: string;

  addressLine1?: string;
  addressLine2?: string;

  city?: string;
  state?: string;
  pincode?: string;

  contactNumber?: string;

  gstin?: string;
  fssaiLicense?: string;

  latitude?: number;
  longitude?: number;

  deliveryRadiusKm?: number;
}

export interface IRestaurantStatus {
  isActive: boolean;
}

export interface IRestaurantValidation {
  id: string;
  ownerId: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface IRestaurantReview {
  id: string;

  foodRating: number | null;
  deliveryRating: number | null;
  packagingRating: number | null;

  reviewText: string | null;

  createdAt: Date;

  user: {
    id: string;
    fullName: string;
    profilePhoto: string | null;
  };
}

export interface IRestaurantReviewFilters {
  page?: number;
  limit?: number;
}

export interface ICreateReview {
  orderId: string;
  foodRating: number;
  deliveryRating: number;
  packagingRating: number;
  reviewText?: string;
}
