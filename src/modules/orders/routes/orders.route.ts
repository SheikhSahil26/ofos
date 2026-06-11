import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { OrdersControllers } from "../controllers/orders.controller";

export class OrdersRoutes implements IRoutes {
  path = "/orders";
  router = Router();
  controller = new OrdersControllers();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // this.router.get("/", this.controller.getRestaurants);
    this.router.get("/place-order", this.controller.createOrder);
    this.router.post("/list-orders", this.controller.listOrders); // lists all orders of authenticated user
  }
}
