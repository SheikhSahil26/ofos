import { Category } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { ICreateCategory, IReorderCategory, IUpdateCategory } from "../interfaces/menu.interface";

export class MenuRepository{
    async createCategory(data: ICreateCategory) {
        return prisma.category.create({
            data: {
                branchId: data.branchId,
                name: data.name,
                displayOrder: data.displayOrder ?? 0,
            },
        });
    }

    async getCategoriesByBranchId(branchId: string){
        return prisma.category.findMany({
            where: {
                branchId,
                isDeleted: false,
            },
            include: {
                _count: {
                    select: {
                    menuItems:{
                        where: {
                            isDeleted: false,
                        },
                    }
                    }
                }
            },
            orderBy: {
                displayOrder: "asc",
            },
        });
    }

    async getCategoryById(id: string): Promise<Category | null> {
        return prisma.category.findFirst({
            where: {
                id,
                isDeleted: false,
            }
        });
    }

    async updateCategory(id: string,data: IUpdateCategory) {
        return prisma.category.update({
            where: { id },
            data,
        });
    }

    async deleteCategory(id: string) {
        return prisma.category.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }

    async reorderCategories(categories: IReorderCategory[]) {
        return prisma.$transaction(
            categories.map((category) =>
            prisma.category.update({
                where: {
                id: category.id,
                },
                data: {
                displayOrder: category.displayOrder,
                },
            })
            )
        );
    }

    async getFullMenu(branchId: string) {
        return prisma.category.findMany({
            where: {
                branchId,
                isDeleted: false,
            },
            orderBy: {
                displayOrder: "asc",
            },
            include: {
                menuItems: {
                    where: {
                        isDeleted: false,
                    },
                    include: {
                        tags: {
                            include: {
                                dietaryTag: true,
                            },
                        },
                        modifierGroups: {
                            where: {
                                isDeleted: false,
                            },
                            include: {
                                options: {
                                    where: {
                                        isDeleted: false,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
}