export interface ICreateCategory {
  branchId: string;
  name: string;
  displayOrder?: number;
}

export interface IUpdateCategory {
  name?: string;
  displayOrder?: number;
}

export interface IReorderCategory {
  id: string;
  displayOrder: number;
}

export interface IReorderCategoriesRequest {
  categories: IReorderCategory[];
}