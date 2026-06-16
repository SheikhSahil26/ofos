// modules/delivery/controllers/delivery.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { DeliveryService } from "../services/delivery.service";

export class DeliveryController {
  private deliveryService = new DeliveryService();
  constructor() {}

  updatePartnerLocation = asyncHandler(
    async (req: Request, res: Response) => {

        const partnerId= req.params.partnerId as string;
        const { latitude, longitude } = req.body;

        const data = await this.deliveryService.updatePartnerLocation(
            partnerId,
            latitude,
            longitude,
        );


    }
  );

assignNearestPartner = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const result = await this.deliveryService.assignNearestPartner(
      orderId,
    );

    return res.status(result.statusCode).json(result);
  }
);
}