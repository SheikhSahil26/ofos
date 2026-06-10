import { prisma } from "../../../config/prisma";
import { ICreateMenuItem, IUpdateMenuItem } from "../interfaces/menu_item.interfaces";

export class MenuItemRepository{
    async createMenuItem(data: ICreateMenuItem) {
        const { tagIds = [], ...menuItemData } = data;

        return prisma.menuItem.create({
            data: {
            ...menuItemData,

                tags: {
                    create: tagIds.map((tagId) => ({
                        tagId,
                    })),
                },
            },
            include: {
            tags: {
                include: {
                dietaryTag: true,
                },
            },
            },
        });
    }

    async getMenuItemsByCategory(categoryId: string) {
        return prisma.menuItem.findMany({
            where: {
                categoryId,
                isDeleted: false,
            },
            include: {
                tags: {
                    include: {
                        dietaryTag: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async getMenuItemById(id: string) {
        return prisma.menuItem.findFirst({
            where: {
                id,
                isDeleted: false,
            },
            include: {
                tags: {
                    include: {
                        dietaryTag: true,
                    },
                },
                modifierGroups: {
                    include: {
                        options: true,
                    },
                },
            },
        });
    }

    async updateMenuItem(id: string, data: IUpdateMenuItem) {
        return prisma.menuItem.update({
            where: {
                id,
            },
            data,
            include: {
                tags: {
                    include: {
                        dietaryTag: true,
                    },
                },
                modifierGroups: true,
            },
        });
    }

    async updateMenuItemImage(id: string, imageUrl: string) {
        return prisma.menuItem.update({
            where: {
                id,
            },
            data: {
                imageUrl,
            },
        });
    }

    async updateAvailability(id: string, isAvailable: boolean) {
        return prisma.menuItem.update({
            where: {
                id,
            },
            data: {
                isAvailable,
            },
        });
    }

    async updateBestseller(id: string, isBestseller: boolean) {
        return prisma.menuItem.update({
            where: {
                id,
            },
            data: {
                isBestseller,
            },
        });
    }

    async deleteMenuItem(id: string) {
        return prisma.menuItem.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }

    async addDietaryTags(menuItemId: string, tagIds: string[]) {
        return prisma.menuItemTag.createMany({
            data: tagIds.map((tagId) => ({
                menuItemId,
                tagId,
            })),
            skipDuplicates: true,
        });
    }

}