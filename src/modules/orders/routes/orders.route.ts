import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { OrdersControllers } from "../controllers/orders.controller";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware";
import { authorizeRoles } from "../../../middlewares/roleMiddlware";

export class OrdersRoutes implements IRoutes {
  path = "/orders";
  router = Router();
  controller = new OrdersControllers();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
  
    this.router.post("/place-order",isAuthenticated,authorizeRoles("CUSTOMER"), this.controller.createOrder);
    this.router.get("/list-orders",isAuthenticated,authorizeRoles("CUSTOMER"), this.controller.listOrders); // lists all orders of authenticated user
    this.router.get("/get-order/:id",isAuthenticated,authorizeRoles("CUSTOMER"), this.controller.getOrder); // fetch a specific order by ID
    this.router.get(`/status-history/:id`,isAuthenticated,authorizeRoles("CUSTOMER","DELIVERY_PARTNER","RESTAURANT_STAFF"), this.controller.getStatusHistory); // fetch a specific order by ID
    // this.router.patch("/:id/status",this.controller.updateOrderStatus);
    //will add role middleware later
    this.router.patch("/change-status/:orderId",isAuthenticated, this.controller.updateOrderStatusByStaff); // fetch a specific order by ID
    this.router.get("/ready-for-pickup",isAuthenticated,authorizeRoles("RESTAURANT_STAFF"), this.controller.getOrdersReadyForPickup); // for restaurant staff to view orders ready for pickup
    this.router.get("/delivery-status/:orderId",isAuthenticated,authorizeRoles("DELIVERY_PARTNER"), this.controller.updateOrderStatusByDeliveryPartner); // for delivery staff to view their pickup history
    this.router.get(
  "/branch-orders-active",
  isAuthenticated,
  this.controller.getBranchOrdersForStaff
);

    // this.router.get("/get-tracking-details/:orderId",isAuthenticated

  }
}
