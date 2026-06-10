export interface ICreateMenuItem {
  branchId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  isVeg?: boolean;
  imageUrl?: string;
  tagIds?: string[];
}

export interface ICategoryParams {
    categoryId: string;
}

export interface IUpdateMenuItem {
    name?: string;
    description?: string;
    price?: number;
    isVeg?: boolean;
    categoryId?: string;
}

export interface IUpdateMenuItemImage {
    imageUrl: string;
}

export interface IToggleAvailability {
    isAvailable: boolean;
}

export interface IToggleBestseller {
    isBestseller: boolean;
} 

export interface IAddDietaryTags {
    tagIds: string[];
}