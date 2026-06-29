import { DeliveryPartnerVerificationStatus, SettlementStatus, VerificationStatus } from "@prisma/client";
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
                    (a: any, b: any) =>
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


    async getUserById(id: string) {
        return prisma.user.findFirst({
            where: {
                id,
                isDeleted: false,
            },
        });
    }
    // to activate and deactivate user
    async updateUserStatus(
        id: string,
        isActive: boolean
    ) {
        return prisma.user.update({
            where: { id },
            data: {
                isActive,
            },
        });
    }


    async getPendingRestaurantApprovals(
        page: number,
        limit: number,
        search?: string
    ) {

        const skip =
            (page - 1) * limit;

        const where = {

            isDeleted: false,

            verificationStatus:
                VerificationStatus.PENDING,

            ...(search && {

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
                    },

                    {
                        head: {
                            user: {
                                fullName: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            }
                        }
                    }

                ]

            })

        };

        const total =
            await prisma.restaurantBranch.count({
                where
            });

        const branches =
            await prisma.restaurantBranch.findMany({

                where,

                skip,

                take: limit,

                orderBy: {
                    createdAt: "desc"
                },

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

                                    fullName: true,

                                    mobile: true
                                }
                            }
                        }
                    }

                }

            });

        return {

            total,

            approvals:

                branches.map(branch => ({

                    branchId:
                        branch.id,

                    restaurantName:
                        branch.restaurant.name,

                    restaurantLogo: branch.restaurant.logoUrl,

                    branchName:
                        branch.branchName,

                    branchHead:
                        branch.head?.user
                            ?.fullName || "N/A",

                    branchContact:
                        branch.contactNumber,

                    city: branch.city,
                    state: branch.state,

                    gstin:
                        branch.gstin,

                    fssaiLicense:
                        branch.fssaiLicense,

                    verificationStatus:
                        branch.verificationStatus,

                    appliedDate:
                        branch.createdAt.toDateString()

                }))
        };
    }


    async getPendingRestaurantApprovalCount() {

        return prisma.restaurantBranch.count({

            where: {

                isDeleted: false,

                verificationStatus:
                    VerificationStatus.PENDING
            }

        });

    }

    async approveBranch(
        branchId: string
    ) {

        const branch =
            await prisma.restaurantBranch.findUnique({

                where: {
                    id: branchId
                }

            });

        if (!branch) {

            throw new Error(
                "Branch not found"
            );

        }

        await prisma.restaurantBranch.update({

            where: {
                id: branchId
            },

            data: {
                verificationStatus: "APPROVED"
            }

        });

        return true;
    }

    async rejectBranch(
        branchId: string
    ) {

        const branch =
            await prisma.restaurantBranch.findUnique({

                where: {
                    id: branchId
                }

            });

        if (!branch) {

            throw new Error(
                "Branch not found"
            );

        }

        await prisma.restaurantBranch.update({

            where: {
                id: branchId
            },

            data: {
                verificationStatus: "REJECTED"
            }

        });

        return true;
    }



    async getPendingPartners(
        page: number,
        limit: number,
        search?: string
    ) {

        const skip =
            (page - 1) * limit;

        const where: any = {
            status: "PENDING_VERIFICATION"
        };

        if (search) {

            where.OR = [

                {
                    user: {
                        fullName: {
                            contains: search,
                            mode: "insensitive"
                        }
                    }
                },

                {
                    user: {
                        email: {
                            contains: search,
                            mode: "insensitive"
                        }
                    }
                },

                {
                    user: {
                        mobile: {
                            contains: search
                        }
                    }
                },

                {
                    vehicleNumber: {
                        contains: search,
                        mode: "insensitive"
                    }
                }

            ];
        }

        const partners =
            await prisma.deliveryPartner.findMany({

                where,

                skip,

                take: limit,

                orderBy: {
                    createdAt: "desc"
                },

                include: {
                    user: true
                }
            });

        const total =
            await prisma.deliveryPartner.count({
                where
            });

        return {
            partners,
            total
        };
    }

    async getStats() {

        const pending =
            await prisma.deliveryPartner.count({
                where: {
                    status: "PENDING_VERIFICATION"
                }
            });

        const active =
            await prisma.deliveryPartner.count({
                where: {
                    status: "ACTIVE"
                }
            });

        const suspended =
            await prisma.deliveryPartner.count({
                where: {
                    status: "SUSPENDED"
                }
            });

        return {
            pending,
            active,
            suspended
        };
    }

    async approvePartner(
        partnerId: string
    ) {

        return await prisma.deliveryPartner.update({

            where: {
                userId: partnerId
            },

            data: {
                status: "INACTIVE"
            }

        });
    }

    async rejectPartner(
        partnerId: string
    ) {

        return await prisma.deliveryPartner.update({

            where: {
                userId: partnerId

            },

            data: {
                status: "SUSPENDED"
            }

        });
    }


    async getDeliveryPartners(
        page: number,
        limit: number,
        search?: string,
        status?: string,
        vehicleType?: string
    ) {

        const skip =
            (page - 1) * limit;

        const where: any = {

            isDeleted: false

        };

        if (search) {

            where.OR = [

                {
                    user: {
                        fullName: {
                            contains: search,
                            // mode: "insensitive"
                        }
                    }
                },

                {
                    user: {
                        email: {
                            contains: search,
                            // mode: "insensitive"
                        }
                    }
                },

                {
                    vehicleNumber: {
                        contains: search,
                        // mode: "insensitive"
                    }
                }

            ];
        }

        if (status) {
            where.status = status;
        }

        if (vehicleType) {
            where.vehicleType = vehicleType;
        }

        const [partners, total] =
            await Promise.all([

                prisma.deliveryPartner.findMany({

                    where,

                    skip,

                    take: limit,

                    include: {

                        user: true,

                        deliveries: true,

                        reviews: true,

                        assignments: true,

                        deliveryPartnerPayouts: true

                    }

                }),

                prisma.deliveryPartner.count({
                    where
                })

            ]);

        return {
            partners,
            total
        };
    }


    async getDeliveryPartnerStats() {

        const [

            totalPartners,
            activePartners,
            inactivePartners,
            suspendedPartners,
            onDeliveryPartners

        ] = await Promise.all([

            prisma.deliveryPartner.count(),

            prisma.deliveryPartner.count({
                where: {
                    status: "ACTIVE"
                }
            }),

            prisma.deliveryPartner.count({
                where: {
                    status: "INACTIVE"
                }
            }),

            prisma.deliveryPartner.count({
                where: {
                    status: "SUSPENDED"
                }
            }),

            prisma.deliveryPartner.count({
                where: {
                    status: "ON_DELIVERY"
                }
            })

        ]);

        return {

            totalPartners,

            activePartners,

            inactivePartners,

            suspendedPartners,

            onDeliveryPartners

        };
    }

    getRestaurantPendingPayouts = async (
        page: number,
        limit: number,
        search?: string
    ) => {

        const skip = (page - 1) * limit;

        const where = {

            verificationStatus: VerificationStatus.APPROVED,

            ...(search && {
                restaurant: {
                    name: {
                        contains: search
                    }
                }
            })

        };

        const [branches, total] = await Promise.all([

            prisma.restaurantBranch.findMany({

                where,

                include: {

                    restaurant: true,

                    head: {
                        include: {
                            user: true
                        }
                    },

                    restaurantPayouts: {
                        where: {
                            status: SettlementStatus.PENDING
                        }
                    }

                },

                skip,
                take: limit

            }),

            prisma.restaurantBranch.count({
                where
            })

        ]);

        return {

            restaurants: branches.map(branch => ({

                branchId: branch.id,

                branchName: branch.branchName,

                restaurantName: branch.restaurant.name,

                ownerName: branch.head?.user.fullName ?? null,

                pendingAmount:
                    branch.restaurantPayouts.reduce(
                        (sum, payout) =>
                            sum + Number(payout.amount),
                        0
                    ),

                pendingOrders:
                    branch.restaurantPayouts.length

            })),

            pagination: {

                total,

                page,

                limit,

                totalPages:
                    Math.ceil(total / limit)

            }

        };

    };



    getDeliveryPartnerPendingPayouts = async (
        page: number,
        limit: number,
        search?: string
    ) => {
        const skip = (page - 1) * limit;

        const where = {
            verificationStatus: DeliveryPartnerVerificationStatus.APPROVED,
            isDeleted: false,

            ...(search && {
                user: {
                    fullName: {
                        contains: search,
                    },
                },
            }),
        };

        const [partners, total] = await Promise.all([
            prisma.deliveryPartner.findMany({
                where,
                include: {
                    user: {
                        select: {
                            fullName: true,
                            mobile: true,
                        },
                    },

                    deliveryPartnerPayouts: {
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
            }),

            prisma.deliveryPartner.count({
                where,
            }),
        ]);

        return {
            deliveryPartners: partners.map((partner) => {
                const pendingPayouts = partner.deliveryPartnerPayouts.filter(
                    payout => payout.status === SettlementStatus.PENDING
                );

                const lastSettlement = partner.deliveryPartnerPayouts
                    .filter(
                        payout =>
                            payout.status === SettlementStatus.SUCCESS &&
                            payout.transferredAt
                    )
                    .sort(
                        (a, b) =>
                            b.transferredAt!.getTime() -
                            a.transferredAt!.getTime()
                    )[0];

                return {
                    deliveryPartnerId: partner.id,
                    deliveryPartnerName: partner.user.fullName,
                    mobile: partner.user.mobile,
                    vehicleNumber: partner.vehicleNumber,

                    pendingOrders: pendingPayouts.length,

                    pendingAmount: pendingPayouts.reduce(
                        (sum, payout) => sum + Number(payout.amount),
                        0
                    ),

                    lastSettlement:
                        lastSettlement?.transferredAt ?? null,
                };
            }),

            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    };
}