import { Request, Response } from "express";
import { PayoutService } from "../services/payout.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";
import { SettlementStatus, SettlementType } from "@prisma/client";

export class PayoutController {
    constructor(
        private payoutService: PayoutService
    ) { }

    getDashboardStats = asyncHandler(async (req, res) => {
        const result =
            await this.payoutService
                .getDashboardStats();

        res.status(
            result.statusCode || 200
        ).json(result);

    });

    processPayout = asyncHandler(
        async (req: Request, res: Response) => {

            const orderId = String(req.params.orderId);

            const response =
                await this.payoutService.processPayout(
                    orderId
                );

            return res
                .status(response.statusCode || 200)
                .json(response);
        }
    );

    getPayoutByOrderId = asyncHandler(
        async (req: Request, res: Response) => {

            const orderId = String(req.params.orderId);

            const response =
                await this.payoutService.getPayoutByOrderId(
                    orderId
                );

            return res
                .status(response.statusCode || 200)
                .json(response);
        }
    );

    getRestaurantPendingSummary = asyncHandler(
        async (req: Request, res: Response) => {

            const { branchHeadId } = req.params;

            if (!branchHeadId || typeof branchHeadId !== 'string') {
                throw new AppError("Branch id must be Required...", 409)
            }

            const result =
                await this.payoutService.getRestaurantPendingSummary(
                    branchHeadId
                );

            return res.status(200).json({
                success: true,
                data: result
            });
        }
    );

    getRestaurantHistory = asyncHandler(
        async (req: Request, res: Response) => {

            const { branchHeadId } = req.params;

            if (!branchHeadId || typeof branchHeadId !== 'string') {
                throw new AppError("Branch id must be Required...", 409)
            }

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const result =
                await this.payoutService.getRestaurantHistory(
                    branchHeadId,
                    page,
                    limit
                );

            return res.status(200).json({
                success: true,
                data: result
            });
        }
    );

    getDeliveryPendingSummary = asyncHandler(
        async (req: Request, res: Response) => {


            const { deliveryPartnerId } = req.params;
            if (!deliveryPartnerId || typeof deliveryPartnerId !== 'string') {
                throw new AppError("Delivery id must be Required...", 409)
            }

            const result =
                await this.payoutService.getDeliveryPendingSummary(
                    deliveryPartnerId
                );

            return res.status(200).json({
                success: true,
                data: result
            });
        }
    );

    getDeliveryHistory = asyncHandler(
        async (req: Request, res: Response) => {

            const { deliveryPartnerId } = req.params;
            if (!deliveryPartnerId || typeof deliveryPartnerId !== 'string') {
                throw new AppError("Delivery id must be Required...", 409)
            }

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const result =
                await this.payoutService.getDeliveryHistory(
                    deliveryPartnerId,
                    page,
                    limit
                );

            return res.status(200).json({
                success: true,
                data: result
            });
        }
    );

    createRestaurantSettlement = asyncHandler(
        async (req: Request, res: Response) => {

            const { branchHeadId } = req.body;
            if (!branchHeadId) {
                throw new AppError("Branch Head id must be Required...", 409)
            }


            const result =
                await this.payoutService.createRestaurantSettlement(
                    branchHeadId
                );

            return res.status(201).json({
                success: true,
                message: "Restaurant settlement created successfully",
                data: result
            });
        }
    );


    createDeliveryPartnerSettlement = asyncHandler(
        async (req: Request, res: Response) => {

            const { deliveryPartnerId } = req.body;
            if (!deliveryPartnerId) {
                throw new AppError("Delivery Partner  id must be Required...", 409)
            }


            const result =
                await this.payoutService.createDeliveryPartnerSettlement(
                    deliveryPartnerId
                );

            return res.status(201).json({
                success: true,
                message: "Delivery Partner settlment created successfully",
                data: result
            });
        }
    );

    getSettlementById = asyncHandler(
        async (req: Request, res: Response) => {
            console.log("....")

            const { settlementId } = req.params;
            if (!settlementId || typeof settlementId !== 'string') {
                throw new AppError("settelmet Id Required..", 409)
            }

            const result =
                await this.payoutService.getSettlementById(
                    settlementId
                );

            return res.status(200).json({
                success: true,
                data: result
            });
        }
    );


    completeSettlement = asyncHandler(
        async (req: Request, res: Response) => {

            const { settlementId } = req.params;
            if (!settlementId || typeof settlementId !== 'string') {
                throw new AppError("settelmet Id Required..", 409)
            }


            const result =
                await this.payoutService.completeSettlement(
                    settlementId
                );

            return res.status(200).json({
                success: true,
                message: "Settlement completed successfully",
                data: result
            });
        }
    );

    getPendingSettlements = asyncHandler(
        async (req, res) => {
            console.log("Helooooooooooooo")
            console.log("pending settlements")

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const result =
                await this.payoutService.getPendingSettlements(
                    page,
                    limit
                );

            return res.status(200).json({
                success: true,
                data: result
            });
        }
    );

    getSettlementHistory = asyncHandler(
        async (req: Request, res: Response) => {

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const status =
                req.query.status as SettlementStatus;

            const type =
                req.query.type as SettlementType;

            const result =
                await this.payoutService.getSettlementHistory(
                    page,
                    limit,
                    status,
                    type
                );

            return res.status(200).json({
                success: true,
                data: result
            });
        }
    );

}