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


export interface CartMenuItemResponse {
  id: string;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  isDeleted: boolean;
}