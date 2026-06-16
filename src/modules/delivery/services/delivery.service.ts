// modules/delivery/services/delivery.service.ts

import Redis from "ioredis";
import { IDeliveryService } from "../interfaces/delivery.interface";
import { DeliveryRepository } from "../repositories/delivery.repository";
import {
  UpdateLocationInput,
  AssignPartnerInput,
} from "../types/delivery.types";
import { ServiceResponse } from "../../../common/types/service-response.types";
import { prisma } from "../../../config/prisma";
import { OrderService } from "../../orders/services/orders.service";
import { CartService } from "../../cart/services/cart.services";
import { AddressService } from "../../address/services/address.service";

export class DeliveryService{
  private deliveryrepo = new DeliveryRepository(prisma);
  constructor(
   
  ) {}
 private orderService =
    new OrderService(
        prisma,
        new CartService(),
        new AddressService()
    );
  async updatePartnerLocation(
   partnerId: string,
   latitude: number,
   longitude: number
  ): Promise<ServiceResponse<any>> {
        
    const updateLocation = await this.deliveryrepo.updatePartnerLocation(partnerId, latitude, longitude);

    return {   
        success: true,
        message: "Location updated successfully",
        data: null,
        statusCode : 200,
    }
  }

  async assignNearestPartner(
    orderId:string
  ): Promise<ServiceResponse<any>> {
    //here
    //the nearest partner with the status active in the platform and free to take delivery are being searched and the best match gets assigned the delivery!!!

    //find the order from order service 

    const order = await this.orderService.getOrderById(orderId)
    //now from this have to fetch the branchId and from that we wil get the lat and long of the branch.




    return {
        success: true,
        message: "Partner assigned successfully",
        data: null, 
        statusCode: 200,
    }
  }

  async assignNearestPartnerWithRetry(
    orderId: string,
    maxRetries: number = 3,
    delayMs: number = 10000,
  ): Promise<void> {









  }
}