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

    console.log(result)

    return res.status(result.statusCode).json(result);
  }
);
  // modules/delivery/controllers/delivery.controller.ts
  toggleAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    // const deliveryUserId = req.user.id; // from auth middleware
    const deliveryUserId = "7fe63448-c733-4055-a2a5-3835aaa65372"

    const result = await this.deliveryService.toggleAvailability({
      deliveryUserId,
    });

    return res.status(result.statusCode).json(result);
  }
);

  getPartnerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // const deliveryUserId = req.user.id;
    const deliveryUserId = "7fe63448-c733-4055-a2a5-3835aaa65372"

    const result = await this.deliveryService.getPartnerProfile(
      deliveryUserId
    );

    return res.status(result.statusCode).json(result);
  }
);

  updatePartnerProfile = asyncHandler(
  async (req: Request, res: Response) => {
   // const deliveryUserId = req.user.id;
    const deliveryUserId = "7fe63448-c733-4055-a2a5-3835aaa65372"
    const { vehicleType, vehicleNumber, governmentId } = req.body;

    const result = await this.deliveryService.updatePartnerProfile({
      deliveryUserId,
      vehicleType,
      vehicleNumber,
      governmentId,
    });

    return res.status(result.statusCode).json(result);
  }
);

// modules/delivery/controllers/delivery.controller.ts

getEarnings = asyncHandler(
  async (req: Request, res: Response) => {
    // const deliveryUserId = req.user.id;
    const deliveryUserId = "7fe63448-c733-4055-a2a5-3835aaa65372"
    const { period } = req.query;

    const result = await this.deliveryService.getEarnings({
      deliveryUserId,
      period: period as "today" | "week" | "month" | "all",
    });

    return res.status(result.statusCode).json(result);
  }
);

// modules/delivery/controllers/delivery.controller.ts

getPartnerRatings = asyncHandler(
  async (req: Request, res: Response) => {
    // const deliveryUserId = req.user.id;
    const deliveryUserId = "7fe63448-c733-4055-a2a5-3835aaa65372"
    const { page, limit } = req.query;

    const result = await this.deliveryService.getPartnerRatings({
      deliveryUserId,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    });

    return res.status(result.statusCode).json(result);
  }
);



  



}