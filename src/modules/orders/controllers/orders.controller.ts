import { Request, Response } from "express";
import { OrderService } from "../services/orders.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AddressService } from "../../address/services/address.service";
import { CartService } from "../../cart/services/cart.services";
import { prisma } from "../../../config/prisma";

export class OrdersControllers {
  private ordersService = new OrderService(
    prisma,
    new CartService(),
    new AddressService(),

  );

      // controllers/order.controller.ts
      createOrder = asyncHandler(

      async(req: Request, res: Response) => {
  const user = req.user as Express.payload
  const { addressId, paymentMethod, couponCode, scheduledAt } = req.body;

  if (!addressId || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: "addressId and paymentMethod are required",
    });
  }

  const result : any = await this.ordersService.createOrder(
    user.userId,
    addressId,
    paymentMethod,
    couponCode,
    scheduledAt,
  );

  return res.status(result.statusCode).json(result);
}
      )

      listOrders = asyncHandler(
        async(req: Request, res: Response) => {
           const user = req.user as Express.payload // dummy

          const result : any = await this.ordersService.listOrders(user.userId);

          return res.status(result.statusCode).json(result.data);
        }
      )

      getOrder = asyncHandler(
        async(req: Request, res: Response) => {
          const orderId = req.params.id as string;
          const user = req.user as Express.payload // dummy

          const result : any = await this.ordersService.getOrderById(orderId);

          console.log("Order details:", result);

          return res.status(result.statusCode).json(result.data);
        }
      )

      getStatusHistory = asyncHandler(
        async(req: Request, res: Response) => {
          const orderId = req.params.id as string;
          const user = req.user as Express.payload // dummy

          const result : any = await this.ordersService.getStatusHistory(orderId, user.userId);

          console.log("Order status history:", result);

          return res.status(result.statusCode).json(result.data);
        }
      )
      // changed the user ids will habve to check later if they are working or not!!!
      updateOrderStatusByStaff = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as Express.payload // replace with req.user.id
    const  orderId  = req.params.orderId as string;

    const result: any= await this.ordersService.updateOrderStatusByStaff(
      orderId,
      user.userId,
    );
    return res.status(result.statusCode).json(result);
  }
);
      
      getOrdersReadyForPickup = asyncHandler(
    async (req: Request, res: Response) => {
    const result:any = await this.ordersService.getOrdersReadyForPickup();
    return res.status(result.statusCode).json(result);
  }
);

updateOrderStatusByDeliveryPartner = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as Express.payload; // replace with req.user.id
    const  orderId  = req.params.orderId as string;

    const result :any = await this.ordersService.updateOrderStatusByDeliveryPartner(
      orderId,
      user.userId,
    );
    return res.status(result.statusCode).json(result);
  }
);

  
 
}
