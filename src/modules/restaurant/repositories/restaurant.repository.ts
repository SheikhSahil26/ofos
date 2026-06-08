import { IExistingRestaurant, IRestaurantValidation } from "../interfaces/restaurant.interface";
import { prisma } from "../../../config/prisma";

export class RestaurantRepository {
  // get restaurant details by id

  async getRestaurantDetails(id: string): Promise<IExistingRestaurant | null> {
    try {
      return await prisma.restaurants.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          logoUrl: true,
          coverImageUrl: true,
          isActive: true,

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
    } catch (err) {
      throw err;
    }
  }

  //get all active restaurants
  async getRestaurants(page: number, limit: number, search?: string) {
    try {
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
        prisma.restaurants.findMany({
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

        prisma.restaurants.count({
          where: whereClause,
        }),
      ]);

      return {
        restaurants,
        total,
      };
    } catch (err) {
      throw err;
    }
  }

  // get restaurants by owner id

  async getRestaurantsByOwnerId(ownerId: string, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const [restaurants, total] = await Promise.all([
        prisma.restaurants.findMany({
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

        prisma.restaurants.count({
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
    } catch (err) {
      throw err;
    }
  }

  // GET nearby restaurants based on user location
  async getNearbyBranches() {
    try {
      return await prisma.restaurant_branches.findMany({
        where: {
          isActive: true,
          isDeleted: false,

          restaurant: {
            isActive: true,
            isDeleted: false,
          },
        },

        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
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
    } catch (err) { 
      throw err;
    }
  }


  //Restaurant validation by id
async validateRestaurantById(
    id: string
): Promise<IRestaurantValidation | null> {
    try{
        return await prisma.restaurants.findUnique({
            where:{
                id
            },
            select:{
                id:true,
                ownerId:true,
                isActive:true,
                isDeleted:true
            }
        });
    }
    catch(err){
        throw err;
    }
}
}
