import { Request, Response } from "express";
import { PayoutService } from "../services/payout.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";

export class PayoutController {
    constructor(
        private payoutService: PayoutService
    ) {}

    processPayout = asyncHandler(
        async (req: Request, res: Response) => {

            const orderId = String(req.params.orderId);

            const response =
                await this.payoutService.processOrderPayout(
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
}