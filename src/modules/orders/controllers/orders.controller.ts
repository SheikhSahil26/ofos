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

  getCart = asyncHandler(
          async (
              req: Request,
              res: Response
          ) => {
  
              const userId = 1; // dummy
  
              const data =
                  await this.ordersService.createOrder(
                      userId
                  );
  
              return res
                  .status(
                      data.statusCode || 200
                  )
                  .json(data);
          }
      );

      // controllers/order.controller.ts
      createOrder = asyncHandler(

        async(req: Request, res: Response) => {
  const userId = 1
  const { addressId, paymentMethod, couponCode, scheduledAt } = req.body;

  if (!addressId || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: "addressId and paymentMethod are required",
    });
  }

  const result = await this.ordersService.createOrder({
    userId,
    addressId,
    paymentMethod,
    couponCode,
    scheduledAt,
  });

  return res.status(result.statusCode).json(result);
}
      )

      listOrders = asyncHandler(
        async(req: Request, res: Response) => {
          const userId = 1; // dummy

          const result = await this.ordersService.listOrders(userId);

          return res.status(result.statusCode).json(result);
        }
      )
  
 
}
