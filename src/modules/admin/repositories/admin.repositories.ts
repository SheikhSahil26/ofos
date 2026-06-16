import { prisma } from "../../../config/prisma";

export class AdminRepository{

    //get user details
    async getUserDetails(id: string) {
        return prisma.user.findFirst({
            where: {
                id,
                isDeleted: false,
            },
            include: {
                userRoles: {
                    include: {
                    role: true,
                    },
                },
                addresses: {
                    where: {
                    isDeleted: false,
                    },
                },
            
            },
        });
    }

    //customer details
    async getCustomerDetails(id: string) {
        return prisma.user.findFirst({
            where: {
                id,
                isDeleted: false,
            },
            include: {
                addresses: {
                    where: {
                        isDeleted: false,
                    },
                },
                orders: true,
                couponUsages: true,
                loyaltyAccount: true,
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }

    //retaurant owner details
    async getRestaurantOwnerDetails(id: string) {
        return prisma.user.findFirst({
            where: {
                id,
                isDeleted: false,
            },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
                ownedRestaurants: {
                    where: {
                        isDeleted: false,
                    },
                    include: {
                        branches: {
                            where: {
                                isDeleted: false,
                            },
                        },
                    },
                },
            },
        });
    }
}