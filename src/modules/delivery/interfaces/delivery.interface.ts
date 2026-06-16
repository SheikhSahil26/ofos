// modules/delivery/interfaces/delivery.interface.ts

import { UpdateLocationInput, AssignPartnerInput } from "../types/delivery.types";
import { ServiceResponse } from "../../../types/service.types";

export interface IDeliveryRepository {
  findPartnerByUserId(userId: string): Promise<any>;
  findActivePartners(): Promise<any[]>;
  findOrderWithBranchAndDelivery(orderId: string): Promise<any>;
  updateDelivery(orderId: string, data: any): Promise<any>;
  createAssignment(data: any): Promise<any>;
  updatePartnerStatus(partnerId: string, status: any): Promise<any>;
  createNotification(data: any): Promise<any>;
  getAdminUserId(): Promise<string>;
}

export interface IDeliveryService {
  updatePartnerLocation(input: UpdateLocationInput): Promise<ServiceResponse<any>>;
  assignNearestPartner(input: AssignPartnerInput): Promise<ServiceResponse<any>>;
  assignNearestPartnerWithRetry(orderId: string, maxRetries?: number, delayMs?: number): Promise<void>;
}

export interface UpdateLocationInput{     
    partnerId: string;      
}