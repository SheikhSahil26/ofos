import { PrismaClient, PayoutStatus, RestaurantPayout, SettlementStatus, SettlementType } from "@prisma/client";
import { any } from "joi";

export class PayoutRepository {
    constructor(private prisma: PrismaClient) { }

    async getOrderById(orderId: string) {
        return this.prisma.order.findUnique({
            where: {
                id: orderId
            },
            include: {
                branch: true,
                delivery: true
            }
        });
    }

    async getPayoutByOrderId(orderId: string) {
        return this.prisma.payoutTransaction.findUnique({
            where: { orderId },
        });
    }

    // async createPayoutTransaction(
    //     orderId: string,
    //     grossAmount: number,
    //     restaurantAmount: number,
    //     deliveryAmount: number,
    //     platformFee: number
    // ) {
    //     return this.prisma.payoutTransaction.create({
    //         data: {
    //             orderId,
    //             grossAmount,
    //             restaurantAmount,
    //             deliveryAmount,
    //             platformFee,
    //             status: PayoutStatus.COMPLETED,
    //             processedAt: new Date(),
    //         },
    //     });
    // }

    async getRestaurantPendingSummary(branchHeadId: string) {

        const [pending, lastSettlement] =
            await Promise.all([
                this.prisma.restaurantPayout.aggregate({
                    where: {
                        branchHeadId,
                        status: "PENDING"
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
                        beneficiaryId: branchHeadId,
                        settlementType: "RESTAURANT",
                        status: "SUCCESS"
                    },
                    orderBy: {
                        settledAt: "desc"
                    }
                })

            ]);

        return {
            branchHeadId,
            pendingAmount:
                pending._sum.amount || 0,
            pendingPayouts:
                pending._count.id,
            lastSettlementDate:
                lastSettlement?.settledAt || null
        };
    }

    // payout.repository.ts

    async getRestaurantHistory(
        branchHeadId: string,
        page: number,
        limit: number
    ) {

        const skip = (page - 1) * limit;

        const [records, total] = await Promise.all([

            this.prisma.restaurantPayout.findMany({
                where: {
                    branchHeadId
                },
                include: {
                    payoutTransaction: {
                        select: {
                            orderId: true,
                            grossAmount: true,
                            processedAt: true
                        }
                    },
                    settlement: {
                        select: {
                            id: true,
                            status: true,
                            settledAt: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit
            }),

            this.prisma.restaurantPayout.count({
                where: {
                    branchHeadId
                }
            })

        ]);

        return {
            records,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getDeliveryPendingSummary(
        deliveryPartnerId: string
    ) {

        const [pending, lastSettlement] =
            await Promise.all([

                this.prisma.deliveryPartnerPayout.aggregate({
                    where: {
                        deliveryPartnerId,
                        status: "PENDING"
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
                        beneficiaryId: deliveryPartnerId,
                        settlementType: "DELIVERY_PARTNER",
                        status: "SUCCESS"
                    },
                    orderBy: {
                        settledAt: "desc"
                    }
                })

            ]);

        return {
            deliveryPartnerId,
            pendingAmount: pending._sum.amount || 0,
            pendingPayouts: pending._count.id,
            lastSettlementDate:
                lastSettlement?.settledAt || null
        };
    }

    async getDeliveryHistory(
        deliveryPartnerId: string,
        page: number,
        limit: number
    ) {

        const skip = (page - 1) * limit;

        const [records, total] = await Promise.all([

            this.prisma.deliveryPartnerPayout.findMany({
                where: {
                    deliveryPartnerId
                },
                include: {
                    payoutTransaction: {
                        select: {
                            orderId: true,
                            grossAmount: true,
                            processedAt: true
                        }
                    },
                    settlement: {
                        select: {
                            id: true,
                            status: true,
                            settledAt: true
                        }
                    }
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
            records,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }


    async createRestaurantSettlement(
        branchHeadId: string
    ) {

        return await this.prisma.$transaction(
            async (tx) => {

                //Finding Restaurant pending payouts..
                const pendingPayouts =
                    await tx.restaurantPayout.findMany({
                        where: {
                            branchHeadId,
                            status: "PENDING",
                            settlementId: null
                        }
                    });

                if (!pendingPayouts.length) {
                    throw new Error(
                        "No pending payouts found"
                    );
                }

                // Reduce pending ayouts total amounts
                const totalAmount =
                    pendingPayouts.reduce((sum: number,
                        payout: RestaurantPayout) =>
                        sum + Number(payout.amount),
                        0
                    );

                
                // Create settlemanet with pending status of that payouts
                const settlement =
                    await tx.settlement.create({
                        data: {
                            settlementType: "RESTAURANT",
                            beneficiaryId: branchHeadId,
                            totalAmount,
                            payoutCount:
                                pendingPayouts.length,
                            status: "PENDING"
                        }
                    });

                
                // Assign the  settlment id to the each restaurantPayout 
                await tx.restaurantPayout.updateMany({
                    where: {
                        id: {
                            in: pendingPayouts.map(
                                (payout: RestaurantPayout) => payout.id
                            )
                        }
                    },
                    data: {
                        settlementId: settlement.id
                    }

                });

                return settlement;
            }
        );
    }


    async getSettlementById(
        settlementId: string
    ) {

        const settlement =
            await this.prisma.settlement.findUnique({
                where: {
                    id: settlementId
                },
                include: {

                    restaurantPayouts: {
                        include: {
                            payoutTransaction: {
                                select: {
                                    orderId: true,
                                    grossAmount: true,
                                    processedAt: true
                                }
                            }
                        }
                    },

                    deliveryPayouts: {
                        include: {
                            payoutTransaction: {
                                select: {
                                    orderId: true,
                                    grossAmount: true,
                                    processedAt: true
                                }
                            }
                        }
                    }

                }
            });

        if (!settlement) {
            throw new Error(
                "Settlement not found"
            );
        }

        return settlement;
    }

    async completeSettlement(
        settlementId: string
    ) {

        return await this.prisma.$transaction(
            async (tx) => {

                const settlement =
                    await tx.settlement.findUnique({
                        where: {
                            id: settlementId
                        }
                    });

                if (!settlement) {
                    throw new Error(
                        "Settlement not found"
                    );
                }

                if (settlement.status === "SUCCESS") {
                    throw new Error(
                        "Settlement already completed"
                    );
                }

                const now = new Date();

                await tx.settlement.update({
                    where: {
                        id: settlementId
                    },
                    data: {
                        status: "SUCCESS",
                        settledAt: now
                    }
                });

                if (
                    settlement.settlementType ===
                    "RESTAURANT"
                ) {

                    await tx.restaurantPayout.updateMany({
                        where: {
                            settlementId
                        },
                        data: {
                            status: "SUCCESS",
                            transferredAt: now
                        }
                    });

                } else {

                    await tx.deliveryPartnerPayout.updateMany({
                        where: {
                            settlementId
                        },
                        data: {
                            status: "SUCCESS",
                            transferredAt: now
                        }
                    });

                }

                return {
                    settlementId,
                    status: "SUCCESS",
                    settledAt: now
                };
            }
        );
    }


    async getPendingSettlements(
        page: number,
        limit: number
    ) {

        const skip = (page - 1) * limit;

        const [settlements, total] =
            await Promise.all([

                this.prisma.settlement.findMany({
                    where: {
                        status: "PENDING"
                    },
                    orderBy: {
                        createdAt: "asc"
                    },
                    skip,
                    take: limit
                }),

                this.prisma.settlement.count({
                    where: {
                        status: "PENDING"
                    }
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
    }

    async getSettlementHistory(
        page: number,
        limit: number,
        status?: SettlementStatus,
        type?: SettlementType
    ) {

        const skip = (page - 1) * limit;

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
    }
}