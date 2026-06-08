import { ICreateRestaurant, ICreateReview, IExistingRestaurant, IOperatingHourInput, IRestaurantValidation, IUpdateRestaurant } from "../interfaces/restaurant.interface";
import { prisma } from "../../../config/prisma";
import { Prisma } from "@prisma/client";

export class RestaurantRepository {
  // get restaurant details by id

  async getRestaurantDetails(id: string): Promise<IExistingRestaurant | null> {
    try {
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
    } catch (err) {
      throw err;
    }
  }

  // get restaurants by owner id

  async getRestaurantsByOwnerId(ownerId: string, page: number, limit: number) {
    try {
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
    } catch (err) {
      throw err;
    }
  }

  // GET nearby restaurants based on user location
  async getNearbyBranches() {
    try {
      return await prisma.restaurantBranch.findMany({
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
    } catch (err) { 
      throw err;
    }
  }


    // Validate restaurant by id
    async validateRestaurantById(
        id: string
    ): Promise<IRestaurantValidation | null> {
        try{
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
        catch(err){
            throw err;
        }
    }


    // check if restaurant exist
    async findRestaurantByName(
        ownerId:string,
        name:string
    ){
        try{
            return await prisma.restaurant.findFirst({
                where:{
                    ownerId,
                    name,
                    isDeleted:false
                }
            });
        }
        catch(err){
            throw err;
        }
    }

    // create restaurant

    async createRestaurant(
        tx: Prisma.TransactionClient,
        ownerId:string,
        data:ICreateRestaurant
    ){
        try{
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
        catch(err){
            throw err;
        }
    }


    // create branch for restaurant 
    async createBranch(
        tx: Prisma.TransactionClient,
        restaurantId:string,
        data:ICreateRestaurant
    ){
        try{
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
        catch(err){
            throw err;
        }
    }

    async createOperatingHours(
        tx: Prisma.TransactionClient,
        branchId:string,
        operatingHours:IOperatingHourInput[]
    ){
        try{
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
        catch(err){
            throw err;
        }
    }

    // GET Primary branch of restaurant by restaurant id
    async findPrimaryBranchByRestaurantId(
    restaurantId:string
){

    try{

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
    catch(err){
        throw err;
    }
}

// Update restaurant details
async updateRestaurant(
    tx: Prisma.TransactionClient,
    restaurantId:string,
    data:IUpdateRestaurant
){

    try{
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
        });

    }
    catch(err){
        throw err;
    }
}

// update restaurant status

async updateRestaurantStatus(
    restaurantId: string,
    isActive: boolean
){
    try{

        return await prisma.restaurant.update({
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

    }
    catch(err){
        throw err;
    }
}

// Delete restaurant (soft delete)

async softDeleteRestaurant(
    restaurantId: string
){
    try{

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
    catch(err){
        throw err;
    }
}

// GET restaurant reviews by restaurant id
async getRestaurantReviews(
    restaurantId: string,
    page: number,
    limit: number
){
    try{

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
    catch(err){
        throw err;
    }
}

// Average rating for restaurant
async getRestaurantReviewStats(
    restaurantId:string
){
    try{

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
    catch(err){
        throw err;
    }
}

// check if order exists for review
async findOrderForReview(
    orderId: string
){
    try{

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
    catch(err){
        throw err;
    }
}

// check if review already exists
async findReviewByOrderId(
    orderId:string
){
    try{

        return await prisma.review.findUnique({
            where:{
                orderId
            }
        });

    }
    catch(err){
        throw err;
    }
}

// Create review
async createReview(
    userId:string,
    branchId:string,
    deliveryPartnerId:string | null,
    data:ICreateReview
){
    try{

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
    catch(err){
        throw err;
    }
}
}
