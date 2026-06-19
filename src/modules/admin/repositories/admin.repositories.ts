import { VerificationStatus } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { isBranchOpenNow } from "../../restaurantBranch/utils/branch-open-status.util";

export class AdminRepository {

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

    async getAllBranches(
        page: number,
        limit: number,
        search?: string
    ) {

        const skip = (page - 1) * limit;


        const where = {
            verificationStatus: VerificationStatus.APPROVED,

            ...(search
                ? {
                    OR: [
                        {
                            branchName: {
                                contains: search,
                                mode: "insensitive"
                            }
                        },
                        {
                            restaurant: {
                                name: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            }
                        }
                    ]
                }
                : {})
        };

        const total = await prisma.restaurantBranch.count({
            where
        });

        const branches =
            await prisma.restaurantBranch.findMany({

                where,

                skip,

                take: limit,

                include: {

                    restaurant: {
                        select: {
                            id: true,
                            name: true,
                            logoUrl: true
                        }
                    },

                    head: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    mobile: true,
                                    profilePhoto: true
                                }
                            }
                        }
                    },

                    operatingHours: true,

                    _count: {
                        select: {
                            orders: true,
                            reviews: true,
                            categories: true
                        }
                    }
                }
            });

        const transformed =
            await Promise.all(

                branches.map(
                    async (branch) => {

                        const revenue =
                            await prisma.order.aggregate({

                                where: {
                                    branchId: branch.id,
                                    status: "DELIVERED"
                                },

                                _sum: {
                                    totalAmount: true
                                }
                            });

                        const reviewRatings =
                            await prisma.review.aggregate({

                                where: {
                                    branchId: branch.id
                                },

                                _avg: {
                                    foodRating: true,
                                    deliveryRating: true,
                                    packagingRating: true
                                }
                            });

                        const deliveredOrders =
                            await prisma.order.count({
                                where: {
                                    branchId: branch.id,
                                    status: "DELIVERED"
                                }
                            });

                        const cancelledOrders =
                            await prisma.order.count({
                                where: {
                                    branchId: branch.id,
                                    status: "CANCELLED"
                                }
                            });

                        const pendingOrders =
                            await prisma.order.count({
                                where: {
                                    branchId: branch.id,
                                    status: {
                                        in: [
                                            "PLACED",
                                            "CONFIRMED",
                                            "PREPARING",
                                            "READY_FOR_PICKUP",
                                            "PICKED_UP",
                                            "OUT_FOR_DELIVERY"
                                        ]
                                    }
                                }
                            });

                        const avgRating =
                            (
                                (
                                    Number(reviewRatings._avg.foodRating || 0) +
                                    Number(reviewRatings._avg.deliveryRating || 0) +
                                    Number(reviewRatings._avg.packagingRating || 0)
                                ) / 3
                            ).toFixed(1);

                        return {

                            id: branch.id,

                            branchName: branch.branchName,

                            city: branch.city,

                            state: branch.state,

                            address:
                                `${branch.addressLine1 || ""} ${branch.addressLine2 || ""}`,

                            contactNumber:
                                branch.contactNumber,

                            verificationStatus:
                                branch.verificationStatus,

                            isActive:
                                branch.isActive,

                            isPrimary:
                                branch.isPrimary,

                            restaurant: {
                                id:
                                    branch.restaurant.id,

                                name:
                                    branch.restaurant.name,

                                logo:
                                    branch.restaurant.logoUrl
                            },

                            branchHead:
                                branch.head
                                    ? {
                                        id:
                                            branch.head.user.id,

                                        name:
                                            branch.head.user.fullName,

                                        email:
                                            branch.head.user.email,

                                        mobile:
                                            branch.head.user.mobile,

                                        profilePhoto:
                                            branch.head.user.profilePhoto
                                    }
                                    : null,

                            totalOrders:
                                branch._count.orders,

                            deliveredOrders,

                            cancelledOrders,

                            pendingOrders,

                            totalRevenue:
                                Number(
                                    revenue._sum.totalAmount || 0
                                ),

                            totalReviews:
                                branch._count.reviews,

                            averageRating:
                                avgRating,

                            totalCategories:
                                branch._count.categories,

                            isOpenNow:
                                isBranchOpenNow(
                                    branch.operatingHours
                                ),

                            createdAt:
                                branch.createdAt
                        };
                    }
                )
            );

        return {
            branches: transformed,
            total
        };
    }

    async getBranchesStats() {

        const startOfMonth =
            new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
            );

        const [
            totalRestaurants,
            activeRestaurants,
            blockedRestaurants,
            newRestaurantsThisMonth
        ] = await Promise.all([

            prisma.restaurant.count({
                where: {
                    isDeleted: false
                }
            }),

            prisma.restaurant.count({
                where: {
                    isDeleted: false,
                    isActive: true
                }
            }),

            prisma.restaurant.count({
                where: {
                    isDeleted: false,
                    isActive: false
                }
            }),

            prisma.restaurant.count({
                where: {
                    isDeleted: false,
                    createdAt: {
                        gte: startOfMonth
                    }
                }
            })

        ]);

        return {

            totalRestaurants,

            activeRestaurants,

            blockedRestaurants,

            newRestaurantsThisMonth

        };

    }
}