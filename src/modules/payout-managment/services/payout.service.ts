import { OrderStatus, OrderPaymentStatus, PayoutStatus, PrismaClient, SettlementStatus, SettlementType } from "@prisma/client";

import { ServiceResponse } from "../../../common/types/service-response.types";
import { PayoutRepository } from "../repository/payout.repository";
import { AppError } from "../../../utils/appError";
import { IDashboardStatsResponse, IPayoutHistoryResponse, IPendingSummaryResponse, ISettlementListResponse, ISettlementResponse } from "../interface/payout.interface";

export class PayoutService {
    private payoutRepo: PayoutRepository;

    constructor(private prisma: PrismaClient) {
        this.payoutRepo = new PayoutRepository(prisma);
    }

    getDashboardStats = async (): Promise<
        ServiceResponse<IDashboardStatsResponse>
    > => {

        const stats =
            await this.payoutRepo
                .getDashboardStats();

        return {

            success: true,

            message:
                "Dashboard stats fetched successfully",

            data: stats,

            statusCode: 200

        };
    };


    async processPayout(
        orderId: string
    ): Promise<ServiceResponse<any>> {

        const order =
            await this.payoutRepo.getOrderById(orderId);
        console.log(order)

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

        const branchId = order.branch?.id
        if (!branchId) {
            return {
                success: false,
                error: "Branch not found",
                statusCode: 400
            };
        }

        const deliveryPartnerId = order.delivery?.currentPartnerId
        if (!deliveryPartnerId) {
            return {
                success: false,
                error: "Delivery Partner not found",
                statusCode: 400
            };
        }


        // console.log(deliveryPartnerId, " ID ", branchId)


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

                                branchId:
                                    branchId,

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
            message: "Payment and Payout processed successfully",
            data: payout,
            statusCode: 201
        };
    }


    // ==========================================
    // GET PAYOUT BY ORDER ID
    // ==========================================

    getPayoutByOrderId = async (
        orderId: string
    ): Promise<ServiceResponse<any>> => {

        const payout =
            await this.payoutRepo.getPayoutByOrderId(
                orderId
            );

        if (!payout) {
            throw new AppError(
                "Payout not found",
                404
            );
        }

        return {
            success: true,
            message:
                "Payout fetched successfully",
            data: payout,
            statusCode: 200
        };
    };


    // ==========================================
    // RESTAURANT PENDING SUMMARY
    // ==========================================

    getRestaurantPendingSummary = async (
        branchId: string
    ): Promise<ServiceResponse<IPendingSummaryResponse>> => {

        const summary =
            await this.payoutRepo
                .getRestaurantPendingSummary(
                    branchId
                );

        return {
            success: true,
            message:
                "Restaurant payout summary fetched successfully",
            data: summary ?? {
                totalPendingAmount: 0,
                totalPendingPayouts: 0,
                lastSettlementDate: null
            },
            statusCode: 200
        };
    };


    // ==========================================
    // DELIVERY PENDING SUMMARY
    // ==========================================

    getDeliveryPendingSummary = async (
        deliveryPartnerId: string
    ): Promise<ServiceResponse<IPendingSummaryResponse>> => {

        const summary =
            await this.payoutRepo
                .getDeliveryPendingSummary(
                    deliveryPartnerId
                );

        return {
            success: true,
            message:
                "Delivery payout summary fetched successfully",
            data: summary ?? {
                totalPendingAmount: 0,
                totalPendingPayouts: 0,
                lastSettlementDate: null
            },
            statusCode: 200
        };
    };


    // ==========================================
    // RESTAURANT HISTORY
    // ==========================================

    getRestaurantHistory = async (
        branchId: string,
        page: number,
        limit: number
    ): Promise<ServiceResponse<any>> => {

        const result =
            await this.payoutRepo
                .getRestaurantHistory(
                    branchId,
                    page,
                    limit
                );

        return {
            success: true,
            message:
                result.payouts.length
                    ? "Restaurant payout history fetched successfully"
                    : "No payout history found",
            data: result,
            statusCode: 200
        };
    };


    // ==========================================
    // DELIVERY HISTORY
    // ==========================================

    getDeliveryHistory = async (
        deliveryPartnerId: string,
        page: number,
        limit: number
    ): Promise<ServiceResponse<any>> => {

        const result =
            await this.payoutRepo
                .getDeliveryHistory(
                    deliveryPartnerId,
                    page,
                    limit
                );

        return {
            success: true,
            message:
                result.payouts.length
                    ? "Delivery payout history fetched successfully"
                    : "No payout history found",
            data: result,
            statusCode: 200
        };
    };


    // ==========================================
    // CREATE RESTAURANT SETTLEMENT
    // ==========================================

    createRestaurantSettlement = async (
        branchId: string
    ): Promise<ServiceResponse<any>> => {

        const settlement =
            await this.payoutRepo
                .createRestaurantSettlement(
                    branchId
                );

        if (!settlement) {
            throw new AppError(
                "No pending payouts available",
                400
            );
        }

        return {
            success: true,
            message:
                "Restaurant settlement created successfully",
            data: settlement,
            statusCode: 201
        };
    };


    // ==========================================
    // CREATE DELIVERY SETTLEMENT
    // ==========================================

    createDeliveryPartnerSettlement = async (
        deliveryPartnerId: string
    ): Promise<ServiceResponse<any>> => {

        const settlement =
            await this.payoutRepo
                .createDeliveryPartnerSettlement(
                    deliveryPartnerId
                );

        if (!settlement) {
            throw new AppError(
                "No pending payouts available",
                400
            );
        }

        return {
            success: true,
            message:
                "Delivery settlement created successfully",
            data: settlement,
            statusCode: 201
        };
    };


    // ==========================================
    // GET SETTLEMENT BY ID
    // ==========================================

    getSettlementById = async (
        settlementId: string
    ): Promise<ServiceResponse<any>> => {

        const settlement =
            await this.payoutRepo.getSettlementById(
                settlementId
            );

        if (!settlement) {
            throw new AppError(
                "Settlement not found",
                404
            );
        }

        return {
            success: true,
            message:
                "Settlement fetched successfully",
            data: settlement,
            statusCode: 200
        };
    };


    // ==========================================
    // COMPLETE SETTLEMENT
    // ==========================================

    completeSettlement = async (
        settlementId: string
    ): Promise<ServiceResponse<null>> => {

        const settlement =
            await this.payoutRepo.getSettlementById(
                settlementId
            );

        if (!settlement) {
            throw new AppError(
                "Settlement not found",
                404
            );
        }

        if (
            settlement.status ===
            SettlementStatus.SUCCESS
        ) {
            throw new AppError(
                "Settlement already completed",
                400
            );
        }

        await this.payoutRepo.completeSettlement(
            settlementId
        );

        return {
            success: true,
            message:
                "Settlement completed successfully",
            statusCode: 200
        };
    };


    // ==========================================
    // PENDING SETTLEMENTS
    // ==========================================

    getPendingSettlements = async (
        page: number,
        limit: number
    ): Promise<ServiceResponse<ISettlementListResponse>> => {

        const result =
            await this.payoutRepo
                .getPendingSettlements(
                    page,
                    limit
                );

        return {
            success: true,
            message:
                result.settlements?.length
                    ? "Pending settlements fetched successfully"
                    : "No pending settlements found",
            data: result,
            statusCode: 200
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
    ): Promise<ServiceResponse<any>> => {

        const result =
            await this.payoutRepo
                .getSettlementHistory(
                    page,
                    limit,
                    status,
                    type
                );

        return {
            success: true,
            message:
                result.settlements.length
                    ? "Settlement history fetched successfully"
                    : "No settlement history found",
            data: {
                settlements: result.settlements.map(
                    settlement => ({
                        id: settlement.id,
                        amount: Number(
                            settlement.totalAmount
                        ),
                        status: settlement.status,
                        settlementType:
                            settlement.settlementType,
                        beneficiaryId:
                            settlement.beneficiaryId,
                        payoutCount:
                            settlement.payoutCount,
                        settledAt:
                            settlement.settledAt,
                        createdAt:
                            settlement.createdAt
                    })
                ),
                pagination:
                    result.pagination
            },
            statusCode: 200
        };
    };

}