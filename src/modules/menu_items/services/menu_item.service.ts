import { MenuItem } from "@prisma/client";
import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { DietaryTagRepository } from "../../dietaryTags/repositories/dietaryTag.repository";
import { MenuRepository } from "../../menu/repositories/menu.repository";
import { ICreateMenuItem } from "../interfaces/menu_item.interfaces";
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
}