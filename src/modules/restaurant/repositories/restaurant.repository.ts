import { ICreateRestaurant, ICreateReview, IExistingRestaurant, INearbyItem, IOperatingHourInput, IRestaurantsResult, IRestaurantValidation, IUpdateRestaurant } from "../interfaces/restaurant.interface";
import { prisma } from "../../../config/prisma";
import { Prisma, RestaurantBranch } from "@prisma/client";

export class RestaurantRepository {
  // get restaurant details by id

  async getRestaurantDetails(id: string): Promise<IExistingRestaurant | null> {

      return await prisma.restaurant.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          ownerId: true,
          name: true,
          description: true,
          logoUrl: true,
          coverImageUrl: true,
          isActive: true,
          isDeleted: true,

          branches: {
            where: {
              isDeleted: false,
              isActive: true,
            },
            select: {
              id: true,
              branchName: true,
              contactNumber: true,
              city: true,
              state: true,
              pincode: true,
              latitude: true,
              longitude: true,
              isdeleted: true,
              deliveryRadiusKm: true,
              verificationStatus: true,

              operatingHours: {
                select: {
                  dayOfWeek: true,
                  openTime: true,
                  closeTime: true,
                  isClosed: true,
                },
              },
            },
          },
        },
      });
  }

  //get all active restaurants
  async getRestaurants(page: number, limit: number, search?: string): Promise<IRestaurantsResult> {
  
      const skip = (page - 1) * limit;

      const whereClause = {
        isActive: true,
        isDeleted: false,

        ...(search && {
          name: {
            contains: search,
          },
        }),
      };

      const [restaurants, total] = await Promise.all([
        prisma.restaurant.findMany({
          where: whereClause,

          skip,
          take: limit,

          orderBy: {
            createdAt: "desc",
          },

          select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,

            branches: {
              where: {
                isPrimary: true,
                isDeleted: false,
              },
              select: {
                branchName: true,
                city: true,
                state: true,
              },
            },
          },
        }),

        prisma.restaurant.count({
          where: whereClause,
        }),
      ]);

      return {
        restaurants,
        total,
      };
  }

  // get restaurants by owner

  async getRestaurantsByOwnerId(ownerId: string, page: number, limit: number): Promise<IRestaurantsResult> {

      const skip = (page - 1) * limit;

      const [restaurants, total] = await Promise.all([
        prisma.restaurant.findMany({
          where: {
            ownerId,
            isDeleted: false,
          },

          skip,
          take: limit,

          orderBy: {
            createdAt: "desc",
          },

          select: {
            id: true,
            name: true,
            logoUrl: true,
            isActive: true,
            createdAt: true,
          },
        }),

        prisma.restaurant.count({
          where: {
            ownerId,
            isDeleted: false,
          },
        }),
      ]);

      return {
        restaurants,
        total,
      };

  }

  // GET nearby restaurants based on user location
  async getNearbyBranches(): Promise<INearbyItem[]> {
 
      const branches = await prisma.restaurantBranch.findMany({
        where: {
          isActive: true,
          isDeleted: false,

          restaurant: {
            isActive: true,
            isDeleted: false,
          },
        },

        select: {
          id: true,
          branchName: true,

          latitude: true,
          longitude: true,

          city: true,
          state: true,

          restaurant: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
        },
      });

      return branches.map((branch) => ({
        branch: {
          id: branch.id,
          branchName: branch.branchName,
          latitude: branch.latitude ? Number(branch.latitude) : 0,
          longitude: branch.longitude ? Number(branch.longitude) : 0,
          city: branch.city,
          state: branch.state,
          restaurant: branch.restaurant,
        },
        distance: 0,
      }));
 
  }


    // Validate restaurant by id
    async validateRestaurantById(
        id: string
    ): Promise<IRestaurantValidation | null> {

            return await prisma.restaurant.findUnique({
                where:{ id },
                select:{
                    id:true,
                    ownerId:true,
                    isActive:true,
                    isDeleted:true
                }
            });

    }


    // check if restaurant exist
    async findRestaurantByName(
        ownerId:string,
        name:string
    ): Promise<IExistingRestaurant | null> {
            return await prisma.restaurant.findFirst({
                where:{
                    ownerId,
                    name,
                    isDeleted:false
                }
            });

    }

    // create restaurant

    async createRestaurant(
        tx: Prisma.TransactionClient,
        ownerId:string,
        data:ICreateRestaurant
    ): Promise<IExistingRestaurant> {

            return await tx.restaurant.create({
                data:{
                  ownerId,
                  name: data.name,
                  description: data.description ?? null,
                  logoUrl: data.logoUrl ?? null,
                  coverImageUrl: data.coverImageUrl ?? null
                }
            });

    }


    // create branch for restaurant 
    async createBranch(
        tx: Prisma.TransactionClient,
        restaurantId:string,
        data:ICreateRestaurant
    ): Promise<RestaurantBranch> {

            return await tx.restaurantBranch.create({
                data:{
                    restaurantId,

                    branchName:data.branchName,

                    addressLine1:data.addressLine1,
                    addressLine2:data.addressLine2 ?? null,

                    city:data.city,
                    state:data.state,
                    pincode:data.pincode,

                    contactNumber:data.contactNumber,

                    gstin:data.gstin,
                    fssaiLicense:data.fssaiLicense,

                    latitude:data.latitude,
                    longitude:data.longitude,

                    deliveryRadiusKm:data.deliveryRadiusKm,

                    isPrimary:true
                }
            });
        }

    async createOperatingHours(
        tx: Prisma.TransactionClient,
        branchId:string,
        operatingHours:IOperatingHourInput[]
    ): Promise<Prisma.BatchPayload> {
            return await tx.operatingHour.createMany({
                data: operatingHours.map(hour => ({
                    branchId,
                    dayOfWeek:hour.dayOfWeek,
                    openTime:hour.openTime,
                    closeTime:hour.closeTime,
                    isClosed:hour.isClosed ?? false
                }))
            });

    }

    // GET Primary branch of restaurant by restaurant id
    async findPrimaryBranchByRestaurantId(
    restaurantId:string
): Promise<{id:string} | null> {


        return await prisma.restaurantBranch.findFirst({
            where:{
                restaurantId,
                isPrimary:true,
                isDeleted:false
            },
            select:{
                id:true
            }
        });

}

// Update restaurant details
async updateRestaurant(
    tx: Prisma.TransactionClient,
    restaurantId:string,
    data:IUpdateRestaurant
): Promise<IUpdateRestaurant> {

        const updateData: Prisma.RestaurantUpdateInput = {};

        if (data.name !== undefined) {
            updateData.name = data.name;
        }

        if (data.description !== undefined) {
            updateData.description = data.description;
        }

        if (data.logoUrl !== undefined) {
            updateData.logoUrl = data.logoUrl;
        }

        if (data.coverImageUrl !== undefined) {
            updateData.coverImageUrl = data.coverImageUrl;
        }

        if (data.isActive !== undefined) {
            updateData.isActive = data.isActive;
        }

        return await tx.restaurant.update({
            where:{
                id:restaurantId
            },
            data:updateData
        }) as IUpdateRestaurant;


}

// update restaurant status

async updateRestaurantStatus(
    restaurantId: string,
    isActive: boolean
): Promise<IUpdateRestaurant> {


        const res = await prisma.restaurant.update({ 
          where:{
            id: restaurantId
          },
          data:{
            isActive
          },
          select:{
            id:true,
            name:true,
            isActive:true
          }
        });

        // Ensure name is a string to satisfy IUpdateRestaurant
        return {
          id: res.id,
          name: res.name ?? '',
          isActive: res.isActive
        } as IUpdateRestaurant;


}

// Delete restaurant (soft delete)

async softDeleteRestaurant(
    restaurantId: string
): Promise<any> {


        return await prisma.restaurant.update({
            where:{
                id: restaurantId
            },
            data:{
                isDeleted: true,
                deletedAt: new Date(),
                isActive: false
            }
        });


}

// GET restaurant reviews by restaurant id
async getRestaurantReviews(
    restaurantId: string,
    page: number,
    limit: number
): Promise<{ reviews: any[]; total: number }> {

        const skip = (page - 1) * limit;

        const whereClause = {
            isDeleted: false,

            branch:{
                restaurantId
            }
        };

        const [reviews, total] =
        await Promise.all([

            prisma.review.findMany({

                where: whereClause,

                skip,
                take: limit,

                orderBy:{
                    createdAt:"desc"
                },

                select:{
                    id:true,

                    foodRating:true,
                    deliveryRating:true,
                    packagingRating:true,

                    reviewText:true,

                    createdAt:true,

                    user:{
                        select:{
                            id:true,
                            fullName:true,
                            profilePhoto:true
                        }
                    },

                    images:{
                        select:{
                            imageUrl:true
                        }
                    }
                }
            }),

            prisma.review.count({
                where: whereClause
            })
        ]);

        return {
            reviews,
            total
        };

}

// Average rating for restaurant
async getRestaurantReviewStats(
    restaurantId:string
): Promise<any> {
   

        const ratings =
        await prisma.review.aggregate({

            where:{
                isDeleted:false,

                branch:{
                    restaurantId
                }
            },

            _avg:{
                foodRating:true,
                deliveryRating:true,
                packagingRating:true
            },

            _count:{
                id:true
            }
        });

        return ratings;

    }

// check if order exists for review
async findOrderForReview(
    orderId: string
) {


        return await prisma.order.findUnique({
            where:{
                id: orderId
            },
            select:{
                id:true,

                customerId:true,

                status:true,

                branchId:true,

                branch:{
                    select:{
                        restaurantId:true
                    }
                }
            }
        });
    }
   

// check if review already exists
async findReviewByOrderId(
    orderId:string
): Promise<any> {
  
        return await prisma.review.findUnique({
            where:{
                orderId
            }
        });

    }


// Create review
async createReview(
    userId:string,
    branchId:string,
    deliveryPartnerId:string | null,
    data:ICreateReview
): Promise<any> {
        return await prisma.review.create({

            data:{
                orderId:data.orderId,

                userId,

                branchId,

                deliveryPartnerId,

                foodRating:data.foodRating,

                deliveryRating:data.deliveryRating,

                packagingRating:data.packagingRating,

                reviewText:data.reviewText ?? null
            }
        });

    }
}

