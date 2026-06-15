// modules/delivery/repositories/delivery.repository.ts

import { PrismaClient } from "@prisma/client";
import redisClient from "../../../config/redis";

import { IDeliveryRepository } from "../interfaces/delivery.interface";

export class DeliveryRepository implements IDeliveryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPartnerByUserId(userId: string): Promise<any> {}

  async findActivePartners(): Promise<any[]> {}

  async findOrderWithBranchAndDelivery(orderId: string): Promise<any> {}

  async updateDelivery(orderId: string, data: any): Promise<any> {}

  async createAssignment(data: any): Promise<any> {}

  async updatePartnerStatus(partnerId: string, status: any): Promise<any> {}

  async createNotification(data: any): Promise<any> {}

  async getAdminUserId(): Promise<string> {}

  async updatePartnerLocation(
    partnerId: string,
    latitude: number,
    longitude: number
  ): Promise<any> {
    //here the location of the partner is being updated in the redis in a fixed interval of time!!!! 

    await redisClient.geoAdd("delivery_partners", {
        longitude,
        latitude,
        member: partnerId
    });
  } 

  



}