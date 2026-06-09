import { Request, Response } from "express";
import { OrdersService } from "../services/orders.service";

export class OrdersControllers {
  private restaurantService = new OrdersService();

 
}
