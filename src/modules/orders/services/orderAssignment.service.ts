import { OrdersRepository } from "../repositories/orders.repository";
import { DeliveryRepository } from "../../delivery/repositories/delivery.repository";
import { prisma } from "../../../config/prisma";
import redisClient from "../../../config/redis";
import { DeliveryService } from "../../delivery/services/delivery.service";
import { OrderService } from "./orders.service";
import { ServiceResponse } from "../../../common/types/service-response.type";
import { CartService } from "../../cart/services/cart.services";
import { AddressService } from "../../address/services/address.service";
import { BranchService } from "../../restaurantBranch/services/branch.service";


export class OrderAssignmentService { 
  private orderRepo = new OrdersRepository();
  private branchService = new BranchService();
  private deliveryRepo = new DeliveryRepository(prisma);



  async assignNearestPartner(orderId: string): Promise<ServiceResponse<any>> {
    
    const order = await this.orderRepo.getOrderById(orderId);
    console.log(`Fetched order in orchestrator service ${orderId}:`, order);
    if (!order) {
      return { success: false, error: "Order not found", statusCode: 404 };
    }
    
    
  
    // if (!order.delivery) {
    //   return { success: false, error: "Delivery record not found for this order", statusCode: 404 };
    // }
    // if (order.delivery.currentPartnerId) {
    //   return { success: false, error: "A delivery partner is already assigned to this order", statusCode: 409 };
    // }
  
    // Check no PENDING offer already exists for this delivery — avoid duplicate offers
    // const existingPendingOffer = await this.deliveryRepo.findPendingOffer(order.delivery.id);
    // if (existingPendingOffer) {
    //   return { success: false, error: "An offer is already pending for this order", statusCode: 409 };
    // }
  
    const branchResult = await this.branchService.getBranchDetailsWithoutOwnership(order.branchId);
    if (!branchResult.data) {
      return { success: false, error: "Branch not found", statusCode: 404 };
    }
  
    const branchLat = branchResult.data.latitude;
    const branchLng = branchResult.data.longitude;
    console.log(`Branch coordinates for order ${orderId}: (${branchLat}, ${branchLng})`);
  
    if (branchLat === null || branchLng === null) {
      return { success: false, error: "Branch coordinates not configured", statusCode: 400 };
    }
  
    const nearbyResults = await redisClient.sendCommand([
      "GEORADIUS",
      "delivery_partners",
      branchLng.toString(),
      branchLat.toString(),
      "10",
      "km",
      "WITHDIST",
      "ASC",
      "COUNT", "20",
    ])as unknown as [string, string][];

    console.log(`Nearby delivery partners for order ${orderId}:`, nearbyResults);
  
    if (!nearbyResults || nearbyResults.length === 0) {
      return { success: false, error: "No delivery partners found nearby", statusCode: 503 };
    }
  
    const candidateIds: string[] = (nearbyResults as [string, string][]).map((r) => r[0]);
  
    // Exclude partners who already REJECTED this delivery — don't re-offer to them
    // const rejectedPartnerIds = await this.deliveryRepo.findRejectedPartnerIds(order.delivery.id);
  
    const activePartners = await this.deliveryRepo.findActivePartnersByIds(candidateIds);
    const activePartnerIds = new Set(
  activePartners.map((p) => p.id)
);

    console.log(`Active delivery partners for order ${orderId}:`, activePartners.map(p => p.id));
  
    let chosen: { partnerId: string; distanceKm: number } | null = null;
  
    for (const [partnerId, distance] of nearbyResults as [string, string][]) {

    console.log({
        redisPartnerId: partnerId,
        exists: activePartnerIds.has(partnerId)
    });

    if (activePartnerIds.has(partnerId)) {

        chosen = {
            partnerId,
            distanceKm: parseFloat(distance)
        };

        break;
    }
}

    console.log(` before Chosen partner for order ${orderId}:`, chosen);
  
    if (!chosen) {
      return { success: false, error: "No active delivery partners available right now", statusCode: 503 };
    }
    
    console.log(`Chosen partner for order ${orderId}:`, chosen);
    const chosenPartner = activePartners.find((p) => p.id === chosen!.partnerId)!;
    
    

    console.log(`Chosen partner ${chosenPartner.id} for order ${orderId}, distance: ${chosen.distanceKm.toFixed(2)} km`);

    // ── Create OFFER only — do not touch delivery.currentPartnerId yet ──
    await prisma.$transaction(async (tx) => {


  const delivery = await tx.delivery.findUnique({
  where: {
    orderId: order.id,
  },
});

if (!delivery) {
  throw new Error("Delivery record not found");
}
  
      await tx.deliveryAssignment.create({
        data: {
          deliveryId: delivery.id,
          partnerId: chosenPartner.id,
          assignedAt: new Date(),
          // responseStatus and respondedAt stay null = "pending offer"
        },
      });
  
      await tx.notification.create({
        data: {
          userId: chosenPartner.userId,
          title: "New Delivery Offer",
          message: `New order ${order.orderNumber} available, ${chosen!.distanceKm.toFixed(1)} km away. Accept now!`,
          notificationType: "ORDER_UPDATE",
          status: "PENDING",
        },
      });
    });
  
    return {
      success: true,
      message: "Delivery offer sent to nearest partner",
      data: {
        orderId,
        offeredPartnerId: chosen.partnerId,
        distanceFromBranch: `${chosen.distanceKm.toFixed(2)} km`,
      },
      statusCode: 200,
    };
  }
}