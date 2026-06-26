import {
    PrismaClient,
    SettlementStatus,
    SettlementType,
    RestaurantPayout,
    DeliveryPartnerPayout
} from "@prisma/client";
import { ISettlementListResponse } from "../interface/payout.interface";

export class PayoutRepository {

    constructor(
        private prisma: PrismaClient
    ) { }

    getDashboardStats = async () => {

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        const [

            pendingSettlements,

            restaurantPending,

            deliveryPending,

            todaySettlements,

            totalPaid

        ] = await Promise.all([

            this.prisma.settlement.count({
                where: {
                    status:
                        SettlementStatus.PENDING
                }
            }),

            this.prisma.restaurantPayout.aggregate({
                where: {
                    status:
                        SettlementStatus.PENDING
                },
                _sum: {
                    amount: true
                }
            }),

            this.prisma.deliveryPartnerPayout.aggregate({
                where: {
                    status:
                        SettlementStatus.PENDING
                },
                _sum: {
                    amount: true
                }
            }),

            this.prisma.settlement.count({
                where: {
                    status:
                        SettlementStatus.SUCCESS,
                    settledAt: {
                        gte: today
                    }
                }
            }),

            this.prisma.settlement.aggregate({
                where: {
                    status:
                        SettlementStatus.SUCCESS
                },
                _sum: {
                    totalAmount: true
                }
            })

        ]);

        return {

            pendingSettlements,

            restaurantPendingAmount:
                Number(
                    restaurantPending._sum.amount || 0
                ),

            deliveryPendingAmount:
                Number(
                    deliveryPending._sum.amount || 0
                ),

            todaySettlements,

            totalPaidAmount:
                Number(
                    totalPaid._sum.totalAmount || 0
                )

        };
    };

    // ==========================================
    // ORDER / PAYOUT
    // ==========================================

    getOrderById = async (
        orderId: string
    ) => {

        return await this.prisma.order.findUnique({
            where: {
                id: orderId
            },
            include: {
                branch: true,
                delivery: true
            }
        });

    };

    getPayoutByOrderId = async (
        orderId: string
    ) => {

        return await this.prisma.payoutTransaction.findUnique({
            where: {
                orderId
            }
        });

    };

    // ==========================================
    // RESTAURANT SUMMARY
    // ==========================================

    getRestaurantPendingSummary = async (
        branchId: string
    ) => {

        const [pending, lastSettlement] =
            await Promise.all([

                this.prisma.restaurantPayout.aggregate({
                    where: {
                        branchId,
                        status: SettlementStatus.PENDING
                    },
                    _sum: {
                        amount: true
                    },
                    _count: {
                        id: true
                    }
                }),

                this.prisma.settlement.findFirst({
                    where: {
                        beneficiaryId: branchId,
                        settlementType:
                            SettlementType.RESTAURANT,
                        status:
                            SettlementStatus.SUCCESS
                    },
                    orderBy: {
                        settledAt: "desc"
                    }
                })

            ]);

        return {
            totalPendingAmount:
                Number(
                    pending._sum.amount || 0
                ),

            totalPendingPayouts:
                pending._count.id,

            lastSettlementDate:
                lastSettlement?.settledAt || null
        };
    };

    // ==========================================
    // DELIVERY SUMMARY
    // ==========================================

    getDeliveryPendingSummary = async (
        deliveryPartnerId: string
    ) => {

        const [pending, lastSettlement] =
            await Promise.all([

                this.prisma.deliveryPartnerPayout.aggregate({
                    where: {
                        deliveryPartnerId,
                        status: SettlementStatus.PENDING
                    },
                    _sum: {
                        amount: true
                    },
                    _count: {
                        id: true
                    }
                }),

                this.prisma.settlement.findFirst({
                    where: {
                        beneficiaryId:
                            deliveryPartnerId,
                        settlementType:
                            SettlementType
                                .DELIVERY_PARTNER,
                        status:
                            SettlementStatus.SUCCESS
                    },
                    orderBy: {
                        settledAt: "desc"
                    }
                })

            ]);

        return {
            totalPendingAmount:
                Number(
                    pending._sum.amount || 0
                ),

            totalPendingPayouts:
                pending._count.id,

            lastSettlementDate:
                lastSettlement?.settledAt || null
        };
    };

    // ==========================================
    // RESTAURANT HISTORY
    // ==========================================

    getRestaurantHistory = async (
        branchId: string,
        page: number,
        limit: number
    ) => {

        const skip =
            (page - 1) * limit;

        const [payouts, total] =
            await Promise.all([

                this.prisma.restaurantPayout.findMany({
                    where: {
                        branchId
                    },
                    include: {
                        payoutTransaction: true,
                        settlement: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    skip,
                    take: limit
                }),

                this.prisma.restaurantPayout.count({
                    where: {
                        branchId
                    }
                })

            ]);

        return {
            payouts,
            pagination: {
                total,
                page,
                limit,
                totalPages:
                    Math.ceil(total / limit)
            }
        };
    };

    // ==========================================
    // DELIVERY HISTORY
    // ==========================================

    getDeliveryHistory = async (
        deliveryPartnerId: string,
        page: number,
        limit: number
    ) => {

        const skip =
            (page - 1) * limit;

        const [payouts, total] =
            await Promise.all([

                this.prisma.deliveryPartnerPayout.findMany({
                    where: {
                        deliveryPartnerId
                    },
                    include: {
                        payoutTransaction: true,
                        settlement: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    skip,
                    take: limit
                }),

                this.prisma.deliveryPartnerPayout.count({
                    where: {
                        deliveryPartnerId
                    }
                })

            ]);

        return {
            payouts,
            pagination: {
                total,
                page,
                limit,
                totalPages:
                    Math.ceil(total / limit)
            }
        };
    };

    // ==========================================
    // CREATE RESTAURANT SETTLEMENT
    // ==========================================

    createRestaurantSettlement = async (
        branchId: string
    ) => {

        return await this.prisma.$transaction(
            async tx => {

                const pendingPayouts =
                    await tx.restaurantPayout.findMany({
                        where: {
                            branchId,
                            status:
                                SettlementStatus.PENDING,
                            settlementId: null
                        }
                    });

                if (!pendingPayouts.length) {
                    return null;
                }

                const totalAmount =
                    pendingPayouts.reduce(
                        (
                            sum,
                            payout: RestaurantPayout
                        ) =>
                            sum +
                            Number(
                                payout.amount
                            ),
                        0
                    );

                const settlement =
                    await tx.settlement.create({
                        data: {
                            settlementType:
                                SettlementType.RESTAURANT,

                            beneficiaryId:
                                branchId,

                            totalAmount,

                            payoutCount:
                                pendingPayouts.length,

                            status:
                                SettlementStatus.PENDING
                        }
                    });

                await tx.restaurantPayout.updateMany({
                    where: {
                        id: {
                            in:
                                pendingPayouts.map(
                                    payout =>
                                        payout.id
                                )
                        }
                    },
                    data: {
                        settlementId:
                            settlement.id
                    }
                });

                return settlement;
            }
        );
    };

    // ==========================================
    // CREATE DELIVERY SETTLEMENT
    // ==========================================

    createDeliveryPartnerSettlement = async (
        deliveryPartnerId: string
    ) => {

        return await this.prisma.$transaction(
            async tx => {

                const pendingPayouts =
                    await tx.deliveryPartnerPayout.findMany({
                        where: {
                            deliveryPartnerId,
                            status:
                                SettlementStatus.PENDING,
                            settlementId: null
                        }
                    });

                if (!pendingPayouts.length) {
                    return null;
                }

                const totalAmount =
                    pendingPayouts.reduce(
                        (
                            sum,
                            payout: DeliveryPartnerPayout
                        ) =>
                            sum +
                            Number(
                                payout.amount
                            ),
                        0
                    );

                const settlement =
                    await tx.settlement.create({
                        data: {
                            settlementType:
                                SettlementType
                                    .DELIVERY_PARTNER,

                            beneficiaryId:
                                deliveryPartnerId,

                            totalAmount,

                            payoutCount:
                                pendingPayouts.length,

                            status:
                                SettlementStatus.PENDING
                        }
                    });

                await tx.deliveryPartnerPayout.updateMany({
                    where: {
                        id: {
                            in:
                                pendingPayouts.map(
                                    payout =>
                                        payout.id
                                )
                        }
                    },
                    data: {
                        settlementId:
                            settlement.id
                    }
                });

                return settlement;
            }
        );
    };

    // ==========================================
    // SETTLEMENT
    // ==========================================

    getSettlementById = async (
        settlementId: string
    ) => {

        return await this.prisma.settlement.findUnique({
            where: {
                id: settlementId
            },
            include: {
                restaurantPayouts: {
                    include: {
                        payoutTransaction: true
                    }
                },
                deliveryPayouts: {
                    include: {
                        payoutTransaction: true
                    }
                }
            }
        });
    };

    completeSettlement = async (
        settlementId: string
    ) => {

        return await this.prisma.$transaction(
            async tx => {

                const settlement =
                    await tx.settlement.findUnique({
                        where: {
                            id: settlementId
                        }
                    });

                const now =
                    new Date();

                await tx.settlement.update({
                    where: {
                        id: settlementId
                    },
                    data: {
                        status:
                            SettlementStatus.SUCCESS,
                        settledAt: now
                    }
                });

                if (
                    settlement?.settlementType ===
                    SettlementType.RESTAURANT
                ) {

                    await tx.restaurantPayout.updateMany({
                        where: {
                            settlementId
                        },
                        data: {
                            status:
                                SettlementStatus.SUCCESS,
                            transferredAt:
                                now
                        }
                    });

                } else {

                    await tx.deliveryPartnerPayout.updateMany({
                        where: {
                            settlementId
                        },
                        data: {
                            status:
                                SettlementStatus.SUCCESS,
                            transferredAt:
                                now
                        }
                    });

                }

                return settlement;
            }
        );
    };

    // ==========================================
    // PENDING SETTLEMENTS
    // ==========================================

    getPendingSettlements = async (
        page: number,
        limit: number
    ): Promise<ISettlementListResponse> => {

        const skip = (page - 1) * limit;

        const [settlements, total] =
            await Promise.all([

                this.prisma.settlement.findMany({
                    where: {
                        status: SettlementStatus.PENDING
                    },
                    orderBy: {
                        createdAt: "asc"
                    },
                    skip,
                    take: limit
                }),

                this.prisma.settlement.count({
                    where: {
                        status: SettlementStatus.PENDING
                    }
                })

            ]);

        return {
            settlements: settlements.map(
                settlement => ({
                    ...settlement,
                    totalAmount: Number(
                        settlement.totalAmount
                    )
                })
            ),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    };
    // ==========================================
    // SETTLEMENT HISTORY
    // ==========================================

    getSettlementHistory = async (
        page: number,
        limit: number,
        status?: SettlementStatus,
        type?: SettlementType
    ) => {

        const skip =
            (page - 1) * limit;

        const where = {
            ...(status && { status }),
            ...(type && {
                settlementType: type
            })
        };

        const [settlements, total] =
            await Promise.all([

                this.prisma.settlement.findMany({
                    where,
                    orderBy: {
                        createdAt: "desc"
                    },
                    skip,
                    take: limit
                }),

                this.prisma.settlement.count({
                    where
                })

            ]);

        return {
            settlements,
            pagination: {
                total,
                page,
                limit,
                totalPages:
                    Math.ceil(total / limit)
            }
        };
    };

}