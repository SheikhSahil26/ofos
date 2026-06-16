import { OrderStatus, OrderPaymentStatus, PayoutStatus, PrismaClient, SettlementStatus, SettlementType } from "@prisma/client";

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

        const branchOwnerId = order.branch?.headId
        if (!branchOwnerId) {
            return {
                success: false,
                error: "Branch owner not found",
                statusCode: 400
            };
        }

        const deliveryPartnerId = order.delivery?.id
        if (!deliveryPartnerId) {
            return {
                success: false,
                error: "Delivery Partner not found",
                statusCode: 400
            };
        }

        const grossAmount =
            Number(order.totalAmount);

        const branchAmount =
            Number((grossAmount * 0.80).toFixed(2));

        const deliveryAmount =
            Number((grossAmount * 0.08).toFixed(2));

        const platformFee =
            Number((grossAmount * 0.12).toFixed(2));

        const totalSplit =
            Number(
                (
                    branchAmount +
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
                    Main payout record
                    */

                    const payoutRecord =
                        await tx.payoutTransaction.create({
                            data: {
                                orderId,
                                grossAmount,
                                branchAmount,
                                deliveryAmount,
                                platformFee,
                                status: PayoutStatus.COMPLETED,
                                processedAt: new Date()
                            }
                        });

                    /*
                    Restaurant payout record
                    */

                    const restaurantPayout =
                        await tx.restaurantPayout.create({
                            data: {
                                payoutTransactionId:
                                    payoutRecord.id,

                                branchHeadId:
                                    branchOwnerId,

                                amount:
                                    branchAmount,

                                status:
                                    SettlementStatus.PENDING
                            }
                        });

                    /*
                    Delivery payout record
                    */

                    const deliveryPayout =
                        await tx.deliveryPartnerPayout.create({
                            data: {
                                payoutTransactionId:
                                    payoutRecord.id,

                                deliveryPartnerId:
                                    deliveryPartnerId,

                                amount:
                                    deliveryAmount,

                                status:
                                    SettlementStatus.PENDING
                            }
                        });

                    return {
                        payoutRecord,
                        restaurantPayout,
                        deliveryPayout
                    };
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



    async getRestaurantPendingSummary(
        branchHeadId: string
    ) {

        const summary =
            await this.payoutRepo.getRestaurantPendingSummary(
                branchHeadId
            );

        return summary;
    }

    // payout.service.ts

    async getRestaurantHistory(
        branchHeadId: string,
        page: number,
        limit: number
    ) {

        return await this.payoutRepo.getRestaurantHistory(
            branchHeadId,
            page,
            limit
        );
    }


    async getDeliveryPendingSummary(
        deliveryPartnerId: string
    ) {

        return await this.payoutRepo.getDeliveryPendingSummary(
            deliveryPartnerId
        );
    }


    async getDeliveryHistory(
        deliveryPartnerId: string,
        page: number,
        limit: number
    ) {

        return await this.payoutRepo.getDeliveryHistory(
            deliveryPartnerId,
            page,
            limit
        );
    }


    async createRestaurantSettlement(
        branchHeadId: string
    ) {

        return await this.payoutRepo.createRestaurantSettlement(
            branchHeadId
        );
    }

    async getSettlementById(
        settlementId: string
    ) {
        return await this.payoutRepo.getSettlementById(
            settlementId
        );
    }

    async completeSettlement(
        settlementId: string
    ) {
        return await this.payoutRepo.completeSettlement(
            settlementId
        );
    }

    async getPendingSettlements(
        page: number,
        limit: number
    ) {
        return await this.payoutRepo.getPendingSettlements(
            page,
            limit
        );
    }


    async getSettlementHistory(
        page: number,
        limit: number,
        status?: SettlementStatus,
        type?: SettlementType
    ) {

        return await this.payoutRepo.getSettlementHistory(
            page,
            limit,
            status,
            type
        );
    }


}