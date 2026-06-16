import { Router } from "express";
import { RestaurantController } from "../../restaurant/controlllers/restaurant.controller";
import { OperatingHourController } from "../controller/operating-hour.controller";
import { IRoutes } from "../../../common/interfaces/route.interface";

export class OperatingHourRoutes implements IRoutes {
  path = "/operating-hour";
  router = Router();
  controller = new OperatingHourController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.put(
      "/operating-hours/:id",
      this.controller.updateOperatingHour,
    );
  }
}
