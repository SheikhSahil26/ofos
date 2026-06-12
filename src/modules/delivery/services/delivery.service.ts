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

export class DeliveryService{
  private deliveryrepo = new DeliveryRepository(prisma);
  constructor(
   
  ) {}

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
    input: AssignPartnerInput
  ): Promise<ServiceResponse<any>> {

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
  ): Promise<void> {}
}