import { ModifierGroup, ModifierOption } from "@prisma/client";
import { ServiceResponse } from "../../../common/types/service-response.type";
import { ICreateModifierGroup, ICreateModifierOption, IUpdateModifierGroup, IUpdateModifierOption } from "../interfaces/modifier.interface";
import { ModifierRepository } from "../repositories/modifier.repository";
import { MenuItemRepository } from "../../menu_items/repositories/menu_item.repository";
import { AppError } from "../../../utils/appError";


export class ModifierService{

    private modifierRepository = new ModifierRepository();
    private menuItemRepository = new MenuItemRepository();

    async createModifierGroup(data: ICreateModifierGroup): Promise<ServiceResponse<ModifierGroup>> {

        const menuItem = await this.menuItemRepository.getMenuItemById(data.menuItemId);

        if (!menuItem) {
            throw new AppError(
                "Menu item not found",
                404
            );
        }

        if (data.minSelection && data.maxSelection && data.minSelection > data.maxSelection) {
            throw new AppError(
                "Minimum selection cannot exceed maximum selection",
                400
            );
        }

        const modifierGroup = await this.modifierRepository.createModifierGroup(data);

        return {
            success: true,
            data: modifierGroup,
            message: "Modifier group created successfully",
            statusCode: 201,
        };
    }

    async getModifierGroupsByMenuItemId(menuItemId: string): Promise<ServiceResponse<ModifierGroup[]>> {

        const menuItem = await this.menuItemRepository.getMenuItemById(menuItemId);

        if (!menuItem) {
            throw new AppError(
                "Menu item not found",
                404
            );
        }

        const modifierGroups = await this.modifierRepository.getModifierGroupsByMenuItemId(menuItemId);

        return {
            success: true,
            data: modifierGroups,
            message: "Modifier groups fetched successfully",
            statusCode: 200,
        };
    }

    async updateModifierGroup(id: string, data: IUpdateModifierGroup): Promise<ServiceResponse<ModifierGroup>> {

        const modifierGroup = await this.modifierRepository.getModifierGroupById(id);

        if (!modifierGroup || modifierGroup.isDeleted) {
            throw new AppError(
                "Modifier group not found",
                404
            );
        }

        const minSelection = data.minSelection ?? modifierGroup.minSelection;
        const maxSelection = data.maxSelection ?? modifierGroup.maxSelection;

        if (minSelection > maxSelection) {
            throw new AppError(
                "Minimum selection cannot be greater than maximum selection",
                400
            );
        }

        if (data.isRequired === true && minSelection === 0) {
            throw new AppError(
                "Required modifier groups must have minSelection greater than 0",
                400
            );
        }

        const updatedModifierGroup = await this.modifierRepository.updateModifierGroup(id,data);

        return {
            success: true,
            data: updatedModifierGroup,
            message: "Modifier group updated successfully",
            statusCode: 200,
        };
    }

    async softDeleteModifierGroup(id: string): Promise<ServiceResponse<null>> {

        const modifierGroup = await this.modifierRepository.getModifierGroupById(id);

        if (!modifierGroup) {
            throw new AppError(
                "Modifier group not found",
                404
            );
        }

        await this.modifierRepository.softDeleteModifierGroup(id);

        return {
            success: true,
            message: "Modifier group deleted successfully",
            statusCode: 200,
        };
    }

    async createModifierOption(data: ICreateModifierOption): Promise<ServiceResponse<ModifierOption>> {

        const modifierGroup = await this.modifierRepository.getModifierGroupById(data.modifierGroupId);

        if (!modifierGroup) {
            throw new AppError(
                "Modifier group not found",
                404
            );
        }

        const modifierOption = await this.modifierRepository.createModifierOption(data);

        return {
            success: true,
            data: modifierOption,
            message: "Modifier option created successfully",
            statusCode: 201,
        };
    }

    async getModifierOptionsByGroupId(groupId: string): Promise<ServiceResponse<ModifierOption[]>> {

        const modifierGroup = await this.modifierRepository.getModifierGroupById(groupId);

        if (!modifierGroup) {
            throw new AppError(
                "Modifier group not found",
                404
            );
        }

        const options = await this.modifierRepository.getModifierOptionsByGroupId(groupId);

        return {
            success: true,
            data: options,
            message: "Modifier options fetched successfully",
            statusCode: 200,
        };
    }

    async updateModifierOption(id: string,data: IUpdateModifierOption): Promise<ServiceResponse<ModifierOption>> {

        const modifierOption = await this.modifierRepository.getModifierOptionById(id);

        if (!modifierOption) {
            throw new AppError(
                "Modifier option not found",
                404
            );
        }

        const updatedOption = await this.modifierRepository.updateModifierOption( id, data);

        return {
            success: true,
            data: updatedOption,
            message: "Modifier option updated successfully",
            statusCode: 200,
        };
    }

    async softDeleteModifierOption(id: string): Promise<ServiceResponse<null>> {

        const modifierOption = await this.modifierRepository.getModifierOptionById(id);

        if (!modifierOption) {
            throw new AppError(
                "Modifier option not found",
                404
            );
        }

        await this.modifierRepository.softDeleteModifierOption(id);

        return {
            success: true,
            message: "Modifier option deleted successfully",
            data: null,
            statusCode: 200,
        };
    }

}