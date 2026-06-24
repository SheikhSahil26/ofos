// modules/delivery/repositories/delivery.repository.ts

import { DeliveryPartnerStatus, PrismaClient, VehicleType } from "@prisma/client";
import redisClient from "../../../config/redis";

import { IDeliveryRepository } from "../interfaces/delivery.interface";

export class DeliveryRepository implements IDeliveryRepository {
  constructor(private readonly prisma: PrismaClient) {}
  getAdminUserId(): Promise<string> {
    throw new Error("Method not implemented.");
  }


  async findActivePartnersByIds(partnerIds: string[]): Promise<any[]> {
    return this.prisma.deliveryPartner.findMany({
      where: {
        id: { in: partnerIds },
        isDeleted: false,
      },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });
  }

  async findOrderWithBranchAndDelivery(orderId: string): Promise<any> {}

  async updateDelivery(orderId: string, data: any): Promise<any> {}

  async createAssignment(data: any): Promise<any> {}


  async createNotification(data: any): Promise<any> {}



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

  async findPartnerByUserId(userId: string): Promise<any> {
  return this.prisma.deliveryPartner.findFirst({
    where: {
      userId,
      isDeleted: false,
    },
    select: {
      id: true,
      status: true,
      userId: true,
    },
  });
}

async updatePartnerStatus(
  partnerId: string,
  status: DeliveryPartnerStatus
): Promise<any> {
  return this.prisma.deliveryPartner.update({
    where: { id: partnerId },
    data: { status },
    select: {
      id: true,
      status: true,
      userId: true,
    },
  });
}

  // modules/delivery/repositories/delivery.repository.ts

async clearPartnerLocation(partnerId: string): Promise<void> {
  await redisClient.del(`delivery_partners:${partnerId}`);
}

async findPartnerProfileByUserId(userId: string): Promise<any> {
  return this.prisma.deliveryPartner.findFirst({
    where: {
      userId,
      isDeleted: false,
    },
    select: {
      id: true,
      userId: true,
      vehicleType: true,
      vehicleNumber: true,
      governmentId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          fullName: true,
          email: true,
          mobile: true,
          profilePhoto: true,
          isVerified: true,
        },
      },
    },
  });
}

async createDeliveryPartner(
    data: {
        userId: string;
        vehicleType: VehicleType;
        vehicleNumber: string;
        governmentId: string;
    }
) {

    return await this.prisma.deliveryPartner.create({

        data: {

            userId:
                data.userId,

            vehicleType:
                data.vehicleType,

            vehicleNumber:
                data.vehicleNumber,

            governmentId:
                data.governmentId,

            status:
                DeliveryPartnerStatus
                .PENDING_VERIFICATION

        }

    });

}
  
  async updatePartnerProfile(
  partnerId: string,
  data: Partial<{
    vehicleType: VehicleType;
    vehicleNumber: string;
    governmentId: string;
  }>
): Promise<any> {
  return this.prisma.deliveryPartner.update({
    where: { id: partnerId },
    data,
    select: {
      id: true,
      userId: true,
      vehicleType: true,
      vehicleNumber: true,
      governmentId: true,
      status: true,
      updatedAt: true,
      user: {
        select: {
          fullName: true,
          email: true,
          mobile: true,
          profilePhoto: true,
        },
      },
    },
  });
}

  async findCompletedDeliveries(
  partnerId: string,
  fromDate: Date
): Promise<any[]> {
  return this.prisma.delivery.findMany({
    where: {
      currentPartnerId: partnerId,
      status: "DELIVERED",
      deliveredAt: {
        gte: fromDate,
      },
    },
    select: {
      id: true,
      acceptedAt: true,
      pickedUpAt: true,
      deliveredAt: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          deliveryFee: true,
          placedAt: true,
          branch: {
            select: {
              branchName: true,
              city: true,
            },
          },
          address: {
            select: {
              city: true,
              pincode: true,
            },
          },
        },
      },
    },
    orderBy: { deliveredAt: "desc" },
  });
}

  async findAssignmentStats(
  partnerId: string,
  fromDate: Date
): Promise<any> {
  const [totalAccepted, totalRejected, totalTimedOut] =
    await this.prisma.$transaction([

      this.prisma.deliveryAssignment.count({
        where: {
          partnerId,
          responseStatus: "ACCEPTED",
          assignedAt: { gte: fromDate },
        },
      }),

      this.prisma.deliveryAssignment.count({
        where: {
          partnerId,
          responseStatus: "REJECTED",
          assignedAt: { gte: fromDate },
        },
      }),

      this.prisma.deliveryAssignment.count({
        where: {
          partnerId,
          responseStatus: "TIMED_OUT",
          assignedAt: { gte: fromDate },
        },
      }),

    ]);

  return { totalAccepted, totalRejected, totalTimedOut };
}

  // modules/delivery/repositories/delivery.repository.ts

async findPartnerRatings(
  partnerId: string,
  skip: number,
  take: number
): Promise<{ reviews: any[]; total: number }> {

  const whereClause = {
    deliveryPartnerId: partnerId,
    deliveryRating: { not: null },
    isDeleted: false,
  };

  const [reviews, total] = await this.prisma.$transaction([

    this.prisma.review.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        deliveryRating: true,
        reviewText: true,
        createdAt: true,
        order: {
          select: {
            orderNumber: true,
          },
        },
        user: {
          select: {
            fullName: true,
            profilePhoto: true,
          },
        },
      },
    }),

    this.prisma.review.count({ where: whereClause }),

  ]);

  return { reviews, total };
}

async findPartnerRatingStats(partnerId: string): Promise<any> {

  // Get all ratings for aggregate calculation
  const allRatings = await this.prisma.review.findMany({
    where: {
      deliveryPartnerId: partnerId,
      deliveryRating: { not: null },
      isDeleted: false,
    },
    select: { deliveryRating: true },
  });

  if (allRatings.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  // Count each star rating
  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let ratingSum = 0;

  for (const r of allRatings) {
    const rating = r.deliveryRating!;
    ratingSum += rating;
    if (breakdown[rating] !== undefined) {
      breakdown[rating]++;
    }
  }

  const averageRating = parseFloat(
    (ratingSum / allRatings.length).toFixed(1)
  );

  return {
    averageRating,
    totalReviews: allRatings.length,
    breakdown,
  };
}

// modules/delivery/repositories/delivery.repository.ts

async findPendingOffer(deliveryId: string): Promise<any> {
  return this.prisma.deliveryAssignment.findFirst({
    where: {
      deliveryId,
      responseStatus: null, // not yet responded = pending
    },
  });
}

async findRejectedPartnerIds(deliveryId: string): Promise<Set<string>> {
  const rejected = await this.prisma.deliveryAssignment.findMany({
    where: { deliveryId, responseStatus: "REJECTED" },
    select: { partnerId: true },
  });
  return new Set(rejected.map((r) => r.partnerId));
}

async findPendingOfferForPartner(partnerUserId: string): Promise<any> {
  return this.prisma.deliveryAssignment.findFirst({
    where: {
      responseStatus: null,
      partner: { userId: partnerUserId },
    },
    orderBy: { assignedAt: "desc" },
    include: {
      delivery: {
        include: {
          order: {
            select: {
              orderNumber: true,
              totalAmount: true,
              deliveryFee: true,
              branch: {
                select: { branchName: true, addressLine1: true, city: true, latitude: true, longitude: true },
              },
              address: {
                select: { addressLine1: true, city: true, pincode: true },
              },
            },
          },
        },
      },
    },
  });
}

}