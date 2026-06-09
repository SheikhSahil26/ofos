import { prisma } from "../../../config/prisma";
import { ICreateMenuItem } from "../interfaces/menu_item.interfaces";

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
}