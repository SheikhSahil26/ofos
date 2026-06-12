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
    this.router.post("/place-order", this.controller.createOrder);
    this.router.get("/list-orders", this.controller.listOrders); // lists all orders of authenticated user
    this.router.get("/get-order/:id", this.controller.getOrder); // fetch a specific order by ID
    this.router.get(`/status-history/:id`, this.controller.getStatusHistory); // fetch a specific order by ID
    // this.router.patch("/:id/status",this.controller.updateOrderStatus);
    this.router.patch("/change-status/:orderId", this.controller.updateOrderStatusByStaff); // fetch a specific order by ID
    this.router.get("/ready-for-pickup", this.controller.getOrdersReadyForPickup); // for restaurant staff to view orders ready for pickup
    this.router.get("/delivery-status/:orderId", this.controller.updateOrderStatusByDeliveryPartner); // for delivery staff to view their pickup history
    // this.router.ptach("/payment/success")
  }
}
