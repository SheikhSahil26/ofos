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
    async (req: Request, res: Response) => {}
  );
}