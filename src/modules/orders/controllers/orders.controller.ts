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

    async (req: Request, res: Response) => {
      const userId = 1
      const { addressId, paymentMethod, couponCode, scheduledAt } = req.body;

      if (!addressId || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: "addressId and paymentMethod are required",
        });
      }

      const result: any = await this.ordersService.createOrder({
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
    async (req: Request, res: Response) => {
      const userId = "385d5013-c0c3-4add-972d-e8179f4b9566"; // dummy

      const result: any = await this.ordersService.listOrders(userId);

      return res.status(result.statusCode).json(result.data);
    }
  )

  getOrder = asyncHandler(
    async (req: Request, res: Response) => {
      const orderId = req.params.id as string;
      const userId = "385d5013-c0c3-4add-972d-e8179f4b9566"; // dummy

      const result: any = await this.ordersService.getOrderById(orderId, userId);

      console.log("Order details:", result);

      return res.status(result.statusCode).json(result.data);
    }
  )

  getStatusHistory = asyncHandler(
    async (req: Request, res: Response) => {
      const orderId = req.params.id as string;
      const userId = "385d5013-c0c3-4add-972d-e8179f4b9566"; // dummy

      const result: any = await this.ordersService.getStatusHistory(orderId, userId);

      console.log("Order status history:", result);

      return res.status(result.statusCode).json(result.data);
    }
  )

  updateOrderStatusByStaff = asyncHandler(
    async (req: Request, res: Response) => {
      const staffUserId = "202591c8-b7e9-40d1-be7c-253aa7a0e30a"; // replace with req.user.id
      const orderId = req.params.orderId as string;

      const result: any = await this.ordersService.updateOrderStatusByStaff(
        orderId,
        staffUserId,
      );
      return res.status(result.statusCode).json(result);
    }
  );

  getOrdersReadyForPickup = asyncHandler(
    async (req: Request, res: Response) => {
      const result: any = await this.ordersService.getOrdersReadyForPickup();
      return res.status(result.statusCode).json(result);
    }
  );

  updateOrderStatusByDeliveryPartner = asyncHandler(
    async (req: Request, res: Response) => {
      const deliveryUserId = "7fe63448-c733-4055-a2a5-3835aaa65372"; // replace with req.user.id
      const orderId = req.params.orderId as string;

      const result: any = await this.ordersService.updateOrderStatusByDeliveryPartner(
        orderId,
        deliveryUserId,
      );
      return res.status(result.statusCode).json(result);
    }
  );



}
