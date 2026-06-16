import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { DeliveryController } from "../controllers/delivery.controller";

export class DeliveryRoutes implements IRoutes {
  path = "/delivery";
  router = Router();
  controller = new DeliveryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Update delivery partner location
    this.router.patch(
      "/update-partner-location/:partnerId",
      this.controller.updatePartnerLocation
    );

    // Assign nearest delivery partner to an order
    this.router.post(
      "/assign/:orderId",
      this.controller.assignNearestPartner
    );

    



    
    
    
    
  }
}