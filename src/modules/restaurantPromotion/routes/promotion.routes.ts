import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { RestaurantPromotionController } from "../controller/promotion.controller";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware";

export class RestaurantPromotionRoutes implements IRoutes {
  path = "/restaurants/promotion";
  router = Router();
  controller = new RestaurantPromotionController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes(): void {
    this.router.post("/:restaurantId", isAuthenticated, this.controller.createPromotion);
    this.router.delete("/:id", isAuthenticated, this.controller.deletePromotion);
    this.router.patch("/:id/toggle", isAuthenticated, this.controller.togglePromotionStatus);
    this.router.get("/:restaurantId", isAuthenticated, this.controller.getRestaurantPromotions);
  }
}
