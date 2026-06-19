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
        search?: string,
        status?: string,
        openStatus?: string,
        sortBy?: string
    ) {

        const skip = (page - 1) * limit;

        const where: any = {
            isDeleted: false,
            verificationStatus: "APPROVED"
        };

        // Active / Blocked
        if (status === "ACTIVE") {
            where.isActive = true;
        }

        if (status === "BLOCKED") {
            where.isActive = false;
        }

        // Search
        if (search) {

            where.OR = [

                {
                    branchName: {
                        contains: search
                    }
                },

                {
                    restaurant: {
                        name: {
                            contains: search
                        }
                    }
                },

                {
                    head: {
                        user: {
                            fullName: {
                                contains: search
                            }
                        }
                    }
                }

            ];
        }

        const total =
            await prisma.restaurantBranch.count({
                where
            });

        const branches =
            await prisma.restaurantBranch.findMany({

                where,

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

        let transformed =
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

                        const ratings =
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
                                    Number(ratings._avg.foodRating || 0) +
                                    Number(ratings._avg.deliveryRating || 0) +
                                    Number(ratings._avg.packagingRating || 0)
                                ) / 3
                            ).toFixed(1);

                        const isOpenNow =
                            isBranchOpenNow(
                                branch.operatingHours
                            );

                        return {

                            id: branch.id,

                            branchName:
                                branch.branchName,

                            city:
                                branch.city,

                            state:
                                branch.state,

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

                            isOpenNow,

                            createdAt:
                                branch.createdAt
                        };
                    }
                )
            );

        // Open / Close Filter
        if (openStatus === "OPEN") {

            transformed =
                transformed.filter(
                    branch => branch.isOpenNow
                );
        }

        if (openStatus === "CLOSED") {

            transformed =
                transformed.filter(
                    branch => !branch.isOpenNow
                );
        }

        // Sorting
        switch (sortBy) {

            case "restaurantName":

                transformed.sort(
                    (a : any, b:any) =>
                        a.restaurant.name.localeCompare(
                            b.restaurant.name
                        )
                );

                break;

            case "headName":

                transformed.sort(
                    (a, b) =>
                        (a.branchHead?.name || "")
                            .localeCompare(
                                b.branchHead?.name || ""
                            )
                );

                break;

            case "revenue":

                transformed.sort(
                    (a, b) =>
                        a.totalRevenue -
                        b.totalRevenue
                );

                break;

            case "orders":

                transformed.sort(
                    (a, b) =>
                        a.totalOrders -
                        b.totalOrders
                );

                break;

            default:

                transformed.sort(
                    (a, b) =>
                        (a.branchName || "")
                            .localeCompare(
                                b.branchName || ""
                            )
                );
        }

        const paginated =
            transformed.slice(
                skip,
                skip + limit
            );

        return {

            branches: paginated,

            total:
                transformed.length

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
            totalBranches,
            activeBranches,
            blockedBranches,
            newBranchesThisMonth
        ] = await Promise.all([

            prisma.restaurant.count({
                where: {
                    isDeleted: false,
                    branches: {
                        some: {
                            verificationStatus: "APPROVED",
                            isDeleted: false
                        }
                    }
                }
            }),

            prisma.restaurantBranch.count({
                where: {
                    isDeleted: false,
                    verificationStatus: "APPROVED"
                }
            }),

            prisma.restaurantBranch.count({
                where: {
                    isDeleted: false,
                    verificationStatus: "APPROVED",
                    isActive: true
                }
            }),

            prisma.restaurantBranch.count({
                where: {
                    isDeleted: false,
                    verificationStatus: "APPROVED",
                    isActive: false
                }
            }),

            prisma.restaurantBranch.count({
                where: {
                    isDeleted: false,
                    verificationStatus: "APPROVED",
                    createdAt: {
                        gte: startOfMonth
                    }
                }
            })

        ]);

        return {

            totalRestaurants,

            totalBranches,

            activeBranches,

            blockedBranches,

            newBranchesThisMonth

        };

    }
}