import { Request, Response } from "express";
import { OrdersService } from "../services/orders.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";

export class OrdersControllers {
  private restaurantService = new OrdersService();

  // getCart = asyncHandler(
  //         async (
  //             req: Request,
  //             res: Response
  //         ) => {
  
  //             const userId = 1; // dummy
  
  //             const data =
  //                 await this.OrdersService.placeOrder(
  //                     userId
  //                 );
  
  //             return res
  //                 .status(
  //                     data.statusCode || 200
  //                 )
  //                 .json(data);
  //         }
  //     );
  
 
}
