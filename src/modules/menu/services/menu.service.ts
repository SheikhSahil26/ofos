import { ICreateCategory, IReorderCategory, IUpdateCategory } from "../interfaces/menu.interface";
import { MenuRepository } from "../repositories/menu.repository";
import { ServiceResponse } from "../../../common/types/service-response.type";
import { Category, MenuItem } from "@prisma/client";
import { AppError } from "../../../utils/appError";

export class MenuService{
    private menuRepository = new MenuRepository();
    

    async createCategory(data: ICreateCategory): Promise<ServiceResponse<Category>> {
        const category = await this.menuRepository.createCategory(data);

        return {
            success: true,
            data: category,
            message: "Category created successfully",
            statusCode: 201,
        };
    }

    async getCategoriesByBranchId(branchId: string): Promise<ServiceResponse<Category[]>> {
        const categories = await this.menuRepository.getCategoriesByBranchId(branchId);

        return {
            success: true,
            data: categories,
            message: "Categories fetched successfully",
            statusCode: 200,
        };
    }

    async getCategoryById(id: string): Promise<ServiceResponse<Category>> {
        const category = await this.menuRepository.getCategoryById(id);

        if (!category) {
            throw new AppError("Category not found", 404);
        }

        return {
            success: true,
            data: category,
            message: "Category fetched successfully",
            statusCode: 200,
        };
    }

    async updateCategory(id: string,data: IUpdateCategory): Promise<ServiceResponse<Category>> {

        const category = await this.menuRepository.getCategoryById(id);

        if (!category) {
            throw new AppError("Category not found", 404);
        }

        const updatedCategory =
            await this.menuRepository.updateCategory(id, data);

        return {
            success: true,
            data: updatedCategory,
            message: "Category updated successfully",
            statusCode: 200,
        };
    }

    async deleteCategory(id: string): Promise<ServiceResponse<null>> {
        const category =
            await this.menuRepository.getCategoryById(id);

        if (!category) {
            throw new AppError("Category not found", 404);
        }

        await this.menuRepository.deleteCategory(id);

        return {
            success: true,
            message: "Category deleted successfully",
            statusCode: 200,
        };
    }

    async reorderCategories(categories: IReorderCategory[]): Promise<ServiceResponse<Category[]>> {

        if (!categories.length) {
            throw new AppError("At least one category is required",400);
        }

        const updatedDisplayOrders = await this.menuRepository.reorderCategories(
            categories
        );

        return {
            success: true,
            data: updatedDisplayOrders,
            message: "Categories reordered successfully",
            statusCode: 200,
        };
    }

    async getFullMenu(branchId: string): Promise<ServiceResponse<Category[]>> {

        // const branch = await this.Repository.getBranchById(branchId);

        // if (!branch) {
        //     throw new AppError("Branch not found",404);
        // }

        const menu = await this.menuRepository.getFullMenu(branchId);

        return {
            success: true,
            data: menu,
            message: "Full menu fetched successfully",
            statusCode: 200,
        };
    }
}