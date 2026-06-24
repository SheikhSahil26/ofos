// modules/delivery/controllers/delivery.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { DeliveryService } from "../services/delivery.service";

export class DeliveryController {
  private deliveryService = new DeliveryService();
  constructor() {}

  updatePartnerLocation = asyncHandler(
    async (req: Request, res: Response) => {

        const user= req.user as Express.payload
        console.log("User from request:", user);
        const { latitude, longitude } = req.body;

        console.log("Updating partner location:", {
            userId: user.userId,
            latitude,
            longitude,
        });

        const data = await this.deliveryService.updatePartnerLocation(
            user.userId,
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
    const user = req.user as Express.payload

    const result = await this.deliveryService.toggleAvailability({
      deliveryUserId: user.userId,
    });

    return res.status(result.statusCode).json(result);
  }
);

  getPartnerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // const deliveryUserId = req.user.id;
    const user = req.user as Express.payload

    const result = await this.deliveryService.getPartnerProfile(
      user.userId
    );

    return res.status(result.statusCode).json(result);
  }
);

  updatePartnerProfile = asyncHandler(
  async (req: Request, res: Response) => {
   // const deliveryUserId = req.user.id;
    const user  = req.user as Express.payload
    console.log("User from request:", user);
    const { vehicleType, vehicleNumber, governmentId } = req.body;

    console.log(req.body)

    const result = await this.deliveryService.updatePartnerProfile({
      deliveryUserId: user.userId,
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
     const user  = req.user as Express.payload
    const { period } = req.query;
const deliveryUserId = user.userId;
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
      const user  = req.user as Express.payload
    const { page, limit } = req.query;

    const result = await this.deliveryService.getPartnerRatings({
      deliveryUserId: user.userId,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    });

    return res.status(result.statusCode).json(result);
  }
);



  // modules/delivery/controllers/delivery.controller.ts

getPendingOffer = asyncHandler(async (req: Request, res: Response) => {
    const user  = req.user as Express.payload
  const result = await this.deliveryService.getPendingOffer(user.userId);
  return res.status(result.statusCode).json(result);
});

respondToOffer = asyncHandler(async (req: Request, res: Response) => {
  const user  = req.user as Express.payload
  const partnerUserId = user.userId;
  const assignmentId = req.params.assignmentId as string;
  const { response } = req.body; // "ACCEPTED" or "REJECTED"

  if (!["ACCEPTED", "REJECTED"].includes(response)) {
    return res.status(400).json({ success: false, message: "response must be ACCEPTED or REJECTED" });
  }

  const result = await this.deliveryService.respondToOffer(partnerUserId, assignmentId, response);
  return res.status(result.statusCode).json(result);
});



}