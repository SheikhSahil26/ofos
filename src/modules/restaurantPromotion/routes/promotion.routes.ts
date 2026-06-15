import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { RestaurantPromotionController } from "../controller/promotion.controller";

export class RestaurantPromotionRoutes implements IRoutes {
  path = "/restaurants/promotion";
  router = Router();
  controller = new RestaurantPromotionController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes(): void {
    this.router.post("/:restaurantId", this.controller.createPromotion);
    this.router.delete("/:id", this.controller.deletePromotion);
    this.router.get("/:restaurantId", this.controller.getRestaurantPromotions);
  }
}
