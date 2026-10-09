import { MenuItem } from "@prisma/client";
import { ServiceResponse } from "../../../common/types/service-response.types";
import { AppError } from "../../../utils/appError";
import { DietaryTagRepository } from "../../dietaryTags/repositories/dietaryTag.repository";
import { MenuRepository } from "../../menu/repositories/menu.repository";
import { CartMenuItemResponse, ICreateMenuItem, IUpdateMenuItem } from "../interfaces/menu_item.interfaces";
import { MenuItemRepository } from "../repositories/menu_item.repository";
import { EnrichedCart, EnrichedCartItem } from "../../cart/types/cart.types";
import { Cart, CartItem, CartModifier } from "../interfaces/cart.interface";


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

            const tagIds = data.tagIds
    ? Array.isArray(data.tagIds)
        ? data.tagIds
        : [data.tagIds]
    : [];
            const tags = await this.dietaryTagRepository.getDietaryTagsByIds(tagIds);

            if (tags.length !== tagIds.length) {
                throw new AppError("One or more dietary tags are invalid", 400);
            }

            data.tagIds = tagIds
        }

        console.log(data.name);
        const existingItem: any = await this.menuItemRepository.itemExists(
            data.categoryId,
            data.name,
        )

        console.log(existingItem)
            

        if (!existingItem) {

            
            
            const menuItem = await this.menuItemRepository.createMenuItem(data);
            
            return {
                success: true,
                data: menuItem,
                message: "Menu item created successfully",
                statusCode: 201,
            };
        } else{
            throw new AppError(
                "Menu item already exists in this category",
                409
            );
        }
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

    async removeDietaryTag(menuItemId: string,tagId: string): Promise<ServiceResponse<any>> {

        const menuItem = await this.menuItemRepository.getMenuItemById(menuItemId);

        if (!menuItem) {
            throw new AppError(
                "Menu item not found",
                404
            );
        }

        const menuItemTag = await this.menuItemRepository.getMenuItemTag(menuItemId, tagId);

        if (!menuItemTag) {
            throw new AppError(
                "Dietary tag is not associated with this menu item",
                404
            );
        }

        await this.menuItemRepository.removeDietaryTag(menuItemId,tagId);

        return {
            success: true,
            message: "Dietary tag removed successfully",
            statusCode: 200,
        };
    }

    async searchMenuItems(searchTerm: string): Promise<ServiceResponse<MenuItem[]>> {

    const menuItems = await this.menuItemRepository.searchMenuItems(searchTerm);

    return {
        success: true,
        data: menuItems,
        message: "Menu items fetched successfully",
        statusCode: 200,
    };
}

    async getAllCartMenuItems(cart:Cart,menuItemIds: string[]): Promise<ServiceResponse<CartMenuItemResponse[]>> {

        const menuItems = await this.menuItemRepository.getAllCartMenuItems(menuItemIds);
       
        
       


        return {
            success: true,
            data: menuItems,
            message: "Menu items fetched successfully",
            statusCode: 200,
        };
    }
}