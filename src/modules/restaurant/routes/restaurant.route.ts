import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { RestaurantController } from "../controlllers/restaurant.controller";
import { upload } from "../../../middlewares/multer.middleware";

export class RestaurantRoutes implements IRoutes {
  path = "/restaurants";
  router = Router();
  controller = new RestaurantController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.controller.getRestaurants);
    this.router.post("/", upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),this.controller.createRestaurant);
    this.router.get("/nearby", this.controller.getNearbyRestaurants);
    this.router.get("/owner/my-restaurants", this.controller.getMyRestaurants);
    this.router.put("/:id", this.controller.updateRestaurant);
    this.router.patch("/:id/status", this.controller.updateRestaurantStatus);
    this.router.delete("/:id", this.controller.deleteRestaurant);
    this.router.get("/:id/reviews", this.controller.getRestaurantReviews);
    this.router.get(
      "/restaurant-page/:branchId",
      this.controller.getRestaurantPageData,
    );
  }
}
