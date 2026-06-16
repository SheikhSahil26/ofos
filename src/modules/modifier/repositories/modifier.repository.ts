import { prisma } from "../../../config/prisma";
import { ICreateModifierGroup, ICreateModifierOption, IUpdateModifierGroup, IUpdateModifierOption } from "../interfaces/modifier.interface";

export class ModifierRepository{
    async createModifierGroup(data: ICreateModifierGroup) {
        return prisma.modifierGroup.create({
            data,
        });
    }

    async getModifierGroupsByMenuItemId(menuItemId: string) {
        return prisma.modifierGroup.findMany({
            where: {
                menuItemId,
                isDeleted: false,
            },
            include: {
                options: {
                    where: {
                        isDeleted: false,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
    }

    async updateModifierGroup(id: string,data: IUpdateModifierGroup) {
        return prisma.modifierGroup.update({
            where: {
                id,
            },
            data,
        });
    }

    //helper for update
    async getModifierGroupById(id: string) {
        return prisma.modifierGroup.findFirst({
            where: {
                id,
                isDeleted: false,
            },
        });
    }

    //delete modifier grp
    async softDeleteModifierGroup(id: string) {
        return prisma.modifierGroup.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }

    //create modifier option
    async createModifierOption(data: ICreateModifierOption) {
        return prisma.modifierOption.create({
            data,
        });
    }

    //list all the options in a modifier group
    async getModifierOptionsByGroupId(groupId: string) {
        return prisma.modifierOption.findMany({
            where: {
                modifierGroupId: groupId,
                isDeleted: false,
            },
            orderBy: {
                name: "asc",
            },
        });
    }

    //update modifier option
    async updateModifierOption(id: string, data: IUpdateModifierOption) {
        return prisma.modifierOption.update({
            where: {
                id,
            },
            data,
        });
    }

    //helper for upadate modifier option
    async getModifierOptionById(id: string) {
        return prisma.modifierOption.findFirst({
            where: {
                id,
                isDeleted: false,
            },
        });
    }

    //delete modifier option
    async softDeleteModifierOption(id: string) {
        return prisma.modifierOption.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
}