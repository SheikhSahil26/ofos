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