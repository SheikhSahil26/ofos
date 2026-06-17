import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { DeliveryController } from "../controllers/delivery.controller";
import { authorizeRoles } from "../../../middlewares/roleMiddlware";

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

    this.router.patch(
      "/toggle-availability",
      this.controller.toggleAvailability
    );
    
    this.router.get(
      "/profile",
      
      this.controller.getPartnerProfile
    );

    this.router.put(
      "/profile",
      
      this.controller.updatePartnerProfile
    );

      this.router.get(
    "/earnings",
    this.controller.getEarnings
      );

    this.router.get(
    "/ratings",
    this.controller.getPartnerRatings
      );

    
    
    
    
  }
}