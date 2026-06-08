import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { RestaurantController } from "../controlllers/restaurant.controller";

export class RestaurantRoutes implements IRoutes {
  path = "/restaurants";
  router = Router();
  controller = new RestaurantController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.controller.getRestaurants);
    this.router.get("/nearby", this.controller.getNearbyRestaurants);
    this.router.get("/owner/my-restaurants", this.controller.getMyRestaurants);
  }
}
