import { MenuItem } from "@prisma/client";
import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { DietaryTagRepository } from "../../dietaryTags/repositories/dietaryTag.repository";
import { MenuRepository } from "../../menu/repositories/menu.repository";
import { ICreateMenuItem, IUpdateMenuItem } from "../interfaces/menu_item.interfaces";
import { MenuItemRepository } from "../repositories/menu_item.repository";

export class MenuItemService{
    private menuRepository = new MenuRepository();
    private menuItemRepository = new MenuItemRepository();
    private dietaryTagRepository = new DietaryTagRepository();

    async createMenuItem(data: ICreateMenuItem): Promise<ServiceResponse<MenuItem>> {

        // Check category exists
        const category = await this.menuRepository.getCategoryById(data.categoryId);

        if (!category) {
            throw new AppError("Category not found", 404);
        }

        // Check branch exists // need to uncomment once branch module is done
        //   const branch =
        //     await this.menuRepository.getBranchById(
        //       data.branchId
        //     );

        //   if (!branch) {
        //     throw new AppError("Branch not found", 404);
        //   }

        // Validate dietary tags if provided
        if (data.tagIds?.length) {
            const tags = await this.dietaryTagRepository.getDietaryTagsByIds(data.tagIds);

            if (tags.length !== data.tagIds.length) {
                throw new AppError("One or more dietary tags are invalid", 400);
            }
        }

        const menuItem = await this.menuItemRepository.createMenuItem(data);

        return {
            success: true,
            data: menuItem,
            message: "Menu item created successfully",
            statusCode: 201,
        };
    }

    async getMenuItemsByCategory(categoryId: string): Promise<ServiceResponse<any>> {

        const category =
            await this.menuRepository.getCategoryById(
                categoryId
            );

        if (!category) {
            throw new AppError(
                "Category not found",
                404
            );
        }

        const menuItems =
            await this.menuItemRepository.getMenuItemsByCategory(
                categoryId
            );

        return {
            success: true,
            data: menuItems,
            message: "Menu items fetched successfully",
            statusCode: 200,
        };
    }

    async getMenuItemById(id: string): Promise<ServiceResponse<any>> {

        const menuItem = await this.menuItemRepository.getMenuItemById(id);

        if (!menuItem) {
            throw new AppError(
                "Menu item not found",
                404
            );
        }

        return {
            success: true,
            data: menuItem,
            message: "Menu item fetched successfully",
            statusCode: 200,
        };
    }

    async updateMenuItem(id: string,data: IUpdateMenuItem): Promise<ServiceResponse<any>> {

        const menuItem = await this.menuItemRepository.getMenuItemById(id);

        if (!menuItem) {
            throw new AppError(
                "Menu item not found",
                404
            );
        }

        //if the owner wants to change the category id
        if (data.categoryId) {
            const category =
                await this.menuRepository.getCategoryById(
                    data.categoryId
                );

            if (!category) {
                throw new AppError(
                    "Category not found",
                    404
                );
            }
        }

        const updatedMenuItem =
            await this.menuItemRepository.updateMenuItem(
                id,
                data
            );

        return {
            success: true,
            data: updatedMenuItem,
            message: "Menu item updated successfully",
            statusCode: 200,
        };
    }

    async updateMenuItemImage(id: string, imageUrl: string): Promise<ServiceResponse<any>> {

        const menuItem =
            await this.menuItemRepository.getMenuItemById(id);

        if (!menuItem) {
            throw new AppError(
                "Menu item not found",
                404
            );
        }

        const updatedMenuItem =
            await this.menuItemRepository.updateMenuItemImage(
                id,
                imageUrl
            );

        return {
            success: true,
            data: updatedMenuItem,
            message: "Menu item image updated successfully",
            statusCode: 200,
        };
    }

    async updateAvailability(id: string,isAvailable: boolean): Promise<ServiceResponse<MenuItem>> {

        const menuItem = await this.menuItemRepository.getMenuItemById(id);

        if (!menuItem) {
            throw new AppError(
                "Menu item not found",
                404
            );
        }

        const updatedMenuItem = await this.menuItemRepository.updateAvailability(id, isAvailable);

        return {
            success: true,
            data: updatedMenuItem,
            message: `Menu item ${
                isAvailable ? "enabled" : "disabled"
            } successfully`,
            statusCode: 200,
        };
    }

    async updateBestseller(id: string, isBestseller: boolean): Promise<ServiceResponse<any>> {

        const menuItem = await this.menuItemRepository.getMenuItemById(id);

        if (!menuItem) {
            throw new AppError(
                "Menu item not found",
                404
            );
        }

        const updatedMenuItem =
            await this.menuItemRepository.updateBestseller(id, isBestseller);

        return {
            success: true,
            data: updatedMenuItem,
            message: `Menu item ${
                isBestseller
                    ? "marked as bestseller"
                    : "removed from bestseller"
            } successfully`,
            statusCode: 200,
        };
    }

    async deleteMenuItem(id: string): Promise<ServiceResponse<null>> {

        const menuItem = await this.menuItemRepository.getMenuItemById(id);

        if (!menuItem) {
            throw new AppError(
                "Menu item not found",
                404
            );
        }

        await this.menuItemRepository.deleteMenuItem(id);

        return {
            success: true,
            message: "Menu item deleted successfully",
            statusCode: 200,
        };
    }

    async addDietaryTags(menuItemId: string, tagIds: string[]): Promise<ServiceResponse<any>> {

        const menuItem = await this.menuItemRepository.getMenuItemById(menuItemId);

        if (!menuItem) {
            throw new AppError(
                "Menu item not found",
                404
            );
        }

        const tags = await this.dietaryTagRepository.getDietaryTagsByIds(tagIds);

        if (tags.length !== tagIds.length) {
            throw new AppError(
                "One or more dietary tags are invalid",
                400
            );
        }

        await this.menuItemRepository.addDietaryTags(menuItemId, tagIds);

        const updatedMenuItem =
            await this.menuItemRepository.getMenuItemById(
                menuItemId
            );

        return {
            success: true,
            data: updatedMenuItem,
            message: "Dietary tags added successfully",
            statusCode: 200,
        };
    }
}