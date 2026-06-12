import { OrderStatus, OrderPaymentStatus, PayoutStatus, WalletTransactionType, PrismaClient } from "@prisma/client";

import { ServiceResponse } from "../../../common/types/service-response.types";
import { PayoutRepository } from "../repository/payout.repository";

export class PayoutService {
    private payoutRepo: PayoutRepository;

    constructor(private prisma: PrismaClient) {
        this.payoutRepo = new PayoutRepository(prisma);
    }


    async processPayout(
        orderId: string
    ): Promise<ServiceResponse<any>> {

        const order =
            await this.payoutRepo.getOrderById(orderId);

        if (!order) {
            return {
                success: false,
                error: "Order not found",
                statusCode: 404
            };
        }

        if (order.status !== OrderStatus.DELIVERED) {
            return {
                success: false,
                error: "Order is not delivered",
                statusCode: 400
            };
        }

        if (order.paymentStatus !== OrderPaymentStatus.PAID) {
            return {
                success: false,
                error: "Order payment not completed",
                statusCode: 400
            };
        }

        const existingPayout =
            await this.payoutRepo.getPayoutByOrderId(orderId);

        if (existingPayout) {
            return {
                success: false,
                error: "Payout already processed",
                statusCode: 400
            };
        }

        if (!order.branch?.headId) {
            return {
                success: false,
                error: "Restaurant owner not found",
                statusCode: 400
            };
        }

        if (!order.delivery?.id) {
            return {
                success: false,
                error: "Delivery partner not assigned",
                statusCode: 400
            };
        }

        const grossAmount =
            Number(order.totalAmount);

        const restaurantAmount =
            Number((grossAmount * 0.80).toFixed(2));

        const deliveryAmount =
            Number((grossAmount * 0.08).toFixed(2));

        const platformFee =
            Number((grossAmount * 0.12).toFixed(2));

        const totalSplit =
            Number(
                (
                    restaurantAmount +
                    deliveryAmount +
                    platformFee
                ).toFixed(2)
            );

        if (totalSplit !== grossAmount) {
            throw new Error(
                "Invalid payout split calculation"
            );
        }

        const payout =
            await this.prisma.$transaction(
                async (tx) => {

                    /*
                    Create payout record
                    */

                    const payoutRecord =
                        await tx.payoutTransaction.create({
                            data: {
                                orderId,
                                grossAmount,
                                restaurantAmount,
                                deliveryAmount,
                                platformFee,
                                status:
                                    PayoutStatus.COMPLETED,
                                processedAt:
                                    new Date()
                            }
                        });

                    /*
                    Restaurant Wallet
                    */

                    const restaurantWallet =
                        await tx.wallet.findUnique({
                            where: {
                                userId:
                                    order.branch.restaurant.ownerId
                            }
                        });

                    if (!restaurantWallet) {
                        throw new Error(
                            "Restaurant wallet not found"
                        );
                    }

                    await tx.wallet.update({
                        where: {
                            id: restaurantWallet.id
                        },
                        data: {
                            balance: {
                                increment:
                                    restaurantAmount
                            }
                        }
                    });

                    await tx.walletTransaction.create({
                        data: {
                            walletId:
                                restaurantWallet.id,

                            payoutTransactionId:
                                payoutRecord.id,

                            transactionType:
                                WalletTransactionType.CREDIT,

                            amount:
                                restaurantAmount,

                            description:
                                "Restaurant earnings from order payout"
                        }
                    });

                    /*
                    Rider Wallet
                    */

                    const riderWallet =
                        await tx.wallet.findUnique({
                            where: {
                                userId:
                                    order.delivery.deliveryPartnerId
                            }
                        });

                    if (!riderWallet) {
                        throw new Error(
                            "Delivery partner wallet not found"
                        );
                    }

                    await tx.wallet.update({
                        where: {
                            id: riderWallet.id
                        },
                        data: {
                            balance: {
                                increment:
                                    deliveryAmount
                            }
                        }
                    });

                    await tx.walletTransaction.create({
                        data: {
                            walletId:
                                riderWallet.id,

                            payoutTransactionId:
                                payoutRecord.id,

                            transactionType:
                                WalletTransactionType.CREDIT,

                            amount:
                                deliveryAmount,

                            description:
                                "Delivery earnings from order payout"
                        }
                    });

                    return payoutRecord;
                }
            );

        return {
            success: true,
            message: "Payout processed successfully",
            data: payout,
            statusCode: 201
        };
    }

    async getPayoutByOrderId(
        orderId: string
    ): Promise<ServiceResponse<any>> {

        const payout =
            await this.payoutRepo.getPayoutByOrderId(orderId);

        if (!payout) {
            return {
                success: false,
                error: "Payout not found",
                statusCode: 404,
            };
        }

        return {
            success: true,
            data: payout,
            statusCode: 200,
        };
    }
}