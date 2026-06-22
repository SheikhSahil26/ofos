// modules/delivery/services/delivery.service.ts

import Redis from "ioredis";
import { IDeliveryService } from "../interfaces/delivery.interface";
import { DeliveryRepository } from "../repositories/delivery.repository";
import {
  UpdateLocationInputs,
  AssignPartnerInput,
  ToggleAvailabilityInput,
  ToggleAvailabilityResult,
  UpdateDeliveryPartnerProfileInput,
  GetEarningsInput,
  EarningsSummary,
  GetPartnerRatingsInput,
} from "../types/delivery.types";
import { ServiceResponse } from "../../../common/types/service-response.types";
import { prisma } from "../../../config/prisma";
import { OrderService } from "../../orders/services/orders.service";
import { CartService } from "../../cart/services/cart.services";
import { AddressService } from "../../address/services/address.service";
import { BranchService } from "../../restaurantBranch/services/branch.service";
import redisClient from "../../../config/redis";
import { DeliveryPartnerStatus } from "@prisma/client";

export class DeliveryService{
  private deliveryRepo = new DeliveryRepository(prisma);
  prisma: any;
  constructor(
   
  ) {}
  private branchService = new BranchService();
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
        
    const updateLocation = await this.deliveryRepo.updatePartnerLocation(partnerId, latitude, longitude);

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
    const branchDetails = await this.branchService.getBranchDetails(order.data.branchId,order.data.customerId)

    if (!branchDetails.data) {
      throw new Error("Branch not found");
    }

if (branchDetails.data.latitude === null || branchDetails.data.longitude === null) {
  throw new Error("Branch coordinates not configured");
}


const nearbyPartners = await redisClient.sendCommand([
  "GEORADIUS",
  "delivery_partners",
  branchDetails.data.longitude.toNumber().toString(),
  branchDetails.data.latitude.toNumber().toString(),
  "10",
  "km"
]);

console.log(nearbyPartners);

  console.log(nearbyPartners)






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



  // modules/delivery/services/delivery.service.ts

async toggleAvailability(
  input: ToggleAvailabilityInput
): Promise<ServiceResponse<ToggleAvailabilityResult>> {

  const { deliveryUserId } = input;

  // 1. Find partner profile
  const partner = await this.deliveryRepo.findPartnerByUserId(deliveryUserId);

  if (!partner) {
    return {
      success: false,
      error: "Delivery partner profile not found",
      statusCode: 404,
    };
  }

  // 2. Block toggle for statuses that partner cannot self-manage
  if (partner.status === "PENDING_VERIFICATION") {
    return {
      success: false,
      error: "Your account is pending verification. Please wait for admin approval.",
      statusCode: 403,
    };
  }

  if (partner.status === "SUSPENDED") {
    return {
      success: false,
      error: "Your account has been suspended. Please contact support.",
      statusCode: 403,
    };
  }

  if (partner.status === "ON_DELIVERY") {
    return {
      success: false,
      error: "You cannot go offline while on an active delivery.",
      statusCode: 400,
    };
  }

  // 3. Toggle: ACTIVE → INACTIVE or INACTIVE → ACTIVE
  const previousStatus = partner.status;
  const newStatus =
    partner.status === "ACTIVE"
      ? "INACTIVE"
      : "ACTIVE";

  // 4. Update in DB
  const updated = await this.deliveryRepo.updatePartnerStatus(
    partner.id,
    newStatus as DeliveryPartnerStatus
  );

  // 5. If going INACTIVE — clear their location from Redis
  //    No point keeping stale location for an offline partner
if (newStatus === "INACTIVE") {
  await this.deliveryRepo.clearPartnerLocation(partner.userId);
}
  return {
    success: true,
    message:
      newStatus === "ACTIVE"
        ? "You are now online and accepting orders"
        : "You are now offline",
    data: {
      partnerId: updated.userId,
      previousStatus,
      currentStatus: updated.status,
    },
    statusCode: 200,
  };
}

  async getPartnerProfile(
  deliveryUserId: string
): Promise<ServiceResponse<any>> {

  const partner = await this.deliveryRepo.findPartnerProfileByUserId(
    deliveryUserId
  );

  if (!partner) {
    return {
      success: false,
      error: "Delivery partner profile not found",
      statusCode: 404,
    };
  }

  return {
    success: true,
    message: "Profile fetched successfully",
    data: partner,
    statusCode: 200,
  };
}

async updatePartnerProfile(
  input: UpdateDeliveryPartnerProfileInput
): Promise<ServiceResponse<any>> {

  const { deliveryUserId, vehicleType, vehicleNumber, governmentId } = input;

  // 1. Find partner
  const partner = await this.deliveryRepo.findPartnerByUserId(deliveryUserId);

  if (!partner) {
    return {
      success: false,
      error: "Delivery partner profile not found",
      statusCode: 404,
    };
  }

  // 2. Suspended partners cannot update profile
  if (partner.status === "SUSPENDED") {
    return {
      success: false,
      error: "Your account has been suspended. Please contact support.",
      statusCode: 403,
    };
  }

  // 3. Check vehicle number uniqueness if being updated
  if (vehicleNumber && vehicleNumber !== partner.vehicleNumber) {
    const existing = await this.prisma.deliveryPartner.findFirst({
      where: {
        vehicleNumber,
        isDeleted: false,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "This vehicle number is already registered",
        statusCode: 409,
      };
    }
  }

  // 4. Build update payload — only include fields that were sent
  const updateData: any = {};
  if (vehicleType) updateData.vehicleType = vehicleType;
  if (vehicleNumber) updateData.vehicleNumber = vehicleNumber;
  if (governmentId) updateData.governmentId = governmentId;

  if (Object.keys(updateData).length === 0) {
    return {
      success: false,
      error: "No fields provided to update",
      statusCode: 400,
    };
  }

  // 5. Update
  const updated = await this.deliveryRepo.updatePartnerProfile(
    partner.id,
    updateData
  );

  return {
    success: true,
    message: "Profile updated successfully",
    data: updated,
    statusCode: 200,
  };
}

async getEarnings(
  input: GetEarningsInput
): Promise<ServiceResponse<EarningsSummary>> {

  const { deliveryUserId, period = "month" } = input;

  // 1. Find partner
  const partner = await this.deliveryRepo.findPartnerByUserId(deliveryUserId);

  if (!partner) {
    return {
      success: false,
      error: "Delivery partner profile not found",
      statusCode: 404,
    };
  }

  // 2. Calculate fromDate based on period
  const now = new Date();
  let fromDate: Date;

  if (period === "today") {
    fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  } else if (period === "week") {
    fromDate = new Date(now);
    fromDate.setDate(now.getDate() - 7);
  } else if (period === "month") {
    fromDate = new Date(now);
    fromDate.setMonth(now.getMonth() - 1);
  } else {
    // all time — use account creation as start
    fromDate = new Date(0);
  }

  // 3. Fetch completed deliveries + assignment stats in parallel
  const [completedDeliveries, assignmentStats] = await Promise.all([
    this.deliveryRepo.findCompletedDeliveries(partner.id, fromDate),
    this.deliveryRepo.findAssignmentStats(partner.id, fromDate),
  ]);

  // 4. Calculate earnings
  // Partner earns the delivery fee from each completed order
  const totalDeliveries = completedDeliveries.length;

  const totalEarnings = completedDeliveries.reduce(
    (sum, delivery) => sum + Number(delivery.order.deliveryFee),
    0
  );

  const averageEarningPerDelivery =
    totalDeliveries > 0
      ? parseFloat((totalEarnings / totalDeliveries).toFixed(2))
      : 0;

  // 5. Calculate acceptance rate
  const { totalAccepted, totalRejected, totalTimedOut } = assignmentStats;
  const totalAssignments = totalAccepted + totalRejected + totalTimedOut;

  const acceptanceRate =
    totalAssignments > 0
      ? `${((totalAccepted / totalAssignments) * 100).toFixed(1)}%`
      : "0%";

  // 6. Format recent deliveries — last 10
  const recentDeliveries = completedDeliveries.slice(0, 10).map((d) => ({
    deliveryId: d.id,
    orderNumber: d.order.orderNumber,
    earnings: Number(d.order.deliveryFee),
    pickedUpFrom: d.order.branch.branchName,
    deliveredTo: d.order.address.city,
    deliveredAt: d.deliveredAt,
  }));

  return {
    success: true,
    message: "Earnings summary fetched successfully",
    data: {
      period,
      totalDeliveries,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      averageEarningPerDelivery,
      totalAccepted,
      totalRejected: totalRejected + totalTimedOut,
      acceptanceRate,
      recentDeliveries,
    },
    statusCode: 200,
  };
}


// modules/delivery/services/delivery.service.ts

async getPartnerRatings(
  input: GetPartnerRatingsInput
): Promise<ServiceResponse<any>> {

  const { deliveryUserId, page = 1, limit = 10 } = input;

  // 1. Find partner
  const partner = await this.deliveryRepo.findPartnerByUserId(deliveryUserId);

  if (!partner) {
    return {
      success: false,
      error: "Delivery partner profile not found",
      statusCode: 404,
    };
  }

  const skip = (page - 1) * limit;

  // 2. Fetch stats + paginated reviews in parallel
  const [stats, { reviews, total }] = await Promise.all([
    this.deliveryRepo.findPartnerRatingStats(partner.id),
    this.deliveryRepo.findPartnerRatings(partner.id, skip, limit),
  ]);

  // 3. Format reviews
  const formattedReviews = reviews.map((r) => ({
    reviewId: r.id,
    orderNumber: r.order.orderNumber,
    rating: r.deliveryRating,
    comment: r.reviewText ?? null,
    reviewedBy: {
      fullName: r.user.fullName,
      profilePhoto: r.user.profilePhoto ?? null,
    },
    createdAt: r.createdAt,
  }));

  // 4. Pagination meta
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    message: "Ratings fetched successfully",
    data: {
      summary: {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
        breakdown: {
          fiveStar: stats.breakdown[5],
          fourStar: stats.breakdown[4],
          threeStar: stats.breakdown[3],
          twoStar: stats.breakdown[2],
          oneStar: stats.breakdown[1],
        },
      },
      reviews: formattedReviews,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    statusCode: 200,
  };
}

}