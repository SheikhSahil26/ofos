import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { PayoutService } from "../../payout-managment/services/payout.service";
import { prisma } from "../../../config/prisma";

export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    // private payoutService: PayoutService
  ) { }

  getPaymentByOrderId = asyncHandler(
    async (req: Request, res: Response) => {

      const orderId = String(req.params.orderId);
      const response =
        await this.paymentService.getPaymentByOrderId(orderId);

      return res
        .status(response.statusCode || 200)
        .json(response);
    }
  );


  paymentSuccess = asyncHandler(
    async (req: Request, res: Response) => {

      const { paymentId } = req.body;

      const response =
        await this.paymentService.processPaymentSuccess(
          paymentId
        );
      return res
        .status(response.statusCode || 200)
        .json(response);
    }
  );

  paymentFailure = asyncHandler(
    async (req: Request, res: Response) => {

      const { paymentId, reason } = req.body;

      const response =
        await this.paymentService.processPaymentFailure(
          paymentId,
          reason
        );

      return res
        .status(response.statusCode || 200)
        .json(response);
    }
  );
}