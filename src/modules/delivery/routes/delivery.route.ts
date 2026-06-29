import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { DeliveryController } from "../controllers/delivery.controller";
import { authorizeRoles } from "../../../middlewares/roleMiddlware";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware";

export class DeliveryRoutes implements IRoutes {
  path = "/delivery";
  router = Router();
  controller = new DeliveryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {



    // deliveryPartner.routes.ts

    // Update delivery partner location




    this.router.patch(
      "/update-partner-location",isAuthenticated,
      this.controller.updatePartnerLocation
    );

    // Assign nearest delivery partner to an order
    this.router.post(
      "/assign/:orderId",
      this.controller.assignNearestPartner
    );

    this.router.patch(
      "/toggle-availability",isAuthenticated,
      this.controller.toggleAvailability
    );
    
    this.router.get(
      "/profile",
      isAuthenticated,
      this.controller.getPartnerProfile
    );

    this.router.put(
      "/profile",
      isAuthenticated,
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

    
    this.router.get(
  "/pending-offer",
  isAuthenticated,
  authorizeRoles("DELIVERY_PARTNER"),
  this.controller.getPendingOffer
);

this.router.patch(
  "/offer/:assignmentId/respond",
  isAuthenticated,
  authorizeRoles("DELIVERY_PARTNER"),
  this.controller.respondToOffer
);
    
// routes
this.router.get("/orders/active", isAuthenticated, authorizeRoles("DELIVERY_PARTNER"), this.controller.getActiveOrders);
this.router.get("/current-order", isAuthenticated, authorizeRoles("DELIVERY_PARTNER"), this.controller.getCurrentOrder);
this.router.get("/stats/today", isAuthenticated, authorizeRoles("DELIVERY_PARTNER"), this.controller.getTodayStats);
this.router.get("/deliveries/recent", isAuthenticated, authorizeRoles("DELIVERY_PARTNER"), this.controller.getRecentDeliveries);
this.router.patch("/orders/:assignmentId/accept", isAuthenticated, authorizeRoles("DELIVERY_PARTNER"), this.controller.acceptActiveOrder);
    
  }
}