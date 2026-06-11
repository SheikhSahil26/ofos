import { RestaurantRepository } from "../repositories/restaurant.repository";
import { UserRepository } from "../../user/repositories/user.repository";
import { IRestaurantValidation, INearbyItem, IPagination, IRestaurantsResult, IBranch, ICreateRestaurant, IUpdateRestaurant, ICreateReview } from "../interfaces/restaurant.interface";
import { prisma } from "../../../config/prisma";
import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";


export class RestaurantService{

    private restaurantRepo: RestaurantRepository = new RestaurantRepository();
    private userRepo: UserRepository = new UserRepository();

    //get all restaurants
   async getRestaurants(
    page: number,
    limit: number,
    search?: string
): Promise<ServiceResponse<any[]> & { pagination: IPagination }> {

    if(page < 1){
        page = 1;
    }

    if(limit < 1){
        limit = 10;
    }

    const data: IRestaurantsResult =
    await this.restaurantRepo.getRestaurants(
        page,
        limit,
        search
    );

    return {
        success: true,
        data:data.restaurants,
        pagination:{
            page,
            limit,
            total:data.total
        },
        message: "Restaurants fetched successfully",
        statusCode: 200
     };
    };


    //GET owner restaurants
   async getMyRestaurants(
    ownerId: string,
    page: number,
    limit: number
): Promise<ServiceResponse<any[]> & { pagination: IPagination }> {

    const owner: any =
    await this.userRepo.findUserById(ownerId);

    if(!owner){
        throw new Error("User not found");
    }

    if(owner.isDeleted){
        throw new Error("User account deleted");
    }

    const data: IRestaurantsResult =
    await this.restaurantRepo.getRestaurantsByOwnerId(
        ownerId,
        page,
        limit
    );

    return {
        success: true,
        data: data.restaurants,
        pagination: {
            page,
            limit,
            total: data.total
        },
        message: "Restaurants fetched successfully",
        statusCode: 200
     };
    };

    //GET nearby restaurants
   async getNearbyRestaurants(
    latitude: number,
    longitude: number,
    radius: number
): Promise<ServiceResponse<INearbyItem[]>> {

    const branches =
    await this.restaurantRepo.getNearbyBranches();

    const filtered: INearbyItem[] =
    branches
    .map((branch: any) => {
        const branchLatitude =
        branch.latitude !== null ? Number(branch.latitude) : null;
        const branchLongitude =
        branch.longitude !== null ? Number(branch.longitude) : null;

        if (branchLatitude === null || branchLongitude === null) {
            return null;
        }

        const distance: number =
        this.calculateDistance(
            latitude,
            longitude,
            branchLatitude,
            branchLongitude
        );

        return {
            success: true,
            statusCode: 200,
            branch: {
                ...branch,
                latitude: branchLatitude,
                longitude: branchLongitude
            } as IBranch,
            distance
        } as INearbyItem;
    })

    .filter(
        (item: INearbyItem | null): item is INearbyItem => item !== null
    )

    .filter(
        (item: INearbyItem) => item.distance <= radius
    )

    .sort(
        (a: INearbyItem, b: INearbyItem) =>
        a.distance - b.distance
    );

    return {
        success: true,
        data: filtered,
        message: "Nearby restaurants fetched successfully",
        statusCode: 200
    };
}

// calculate distance
private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371;

    const dLat =
    (lat2 - lat1) * Math.PI / 180;

    const dLon =
    (lon2 - lon1) * Math.PI / 180;

    const a =
    Math.sin(dLat / 2) *
    Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

    const c =
    2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return R * c;
}

//validate restaurant 

async validateRestaurant(
    restaurantId: string
): Promise<ServiceResponse<IRestaurantValidation>>{



        const restaurant =
        await this.restaurantRepo
        .validateRestaurantById(
            restaurantId
        );

        if(!restaurant){
            throw new AppError(
                "Restaurant not found",
                404
            );
        }

        if(restaurant.isDeleted){
            throw new AppError(
                "Restaurant has been deleted",
                404
            );
        }

        return {
            success: true,
            data: restaurant,
            message: "Restaurant validated successfully",
            statusCode: 200
        };


}

//create restaurant
 async createRestaurant(
        ownerId:string,
        data:ICreateRestaurant
    ): Promise<ServiceResponse<{ restaurantId: string; branchId: string }>>{

  
            const owner =
            await this.userRepo
            .findUserById(ownerId);

            if(!owner){
                throw new AppError(
                    "Owner not found",
                    404
                );
            }

            if(owner.isDeleted){
                throw new AppError(
                    "Owner account deleted",
                    404
                );
            }

            if(!data.name?.trim()){
                throw new AppError(
                    "Restaurant name is required",
                    400
                );
            }

            if(!data.branchName?.trim()){
                throw new AppError(
                    "Branch name is required",
                    400
                );
            }

            if(data.gstin.length !== 15){
                throw new AppError(
                    "Invalid GSTIN",
                    400
                );
            }

            if(data.fssaiLicense.length !== 14){
                throw new AppError(
                    "Invalid FSSAI License",
                    400
                );
            }

            if(
                data.latitude < -90 ||
                data.latitude > 90
            ){
                throw new AppError(
                    "Invalid latitude",
                    400
                );
            }

            if(
                data.longitude < -180 ||
                data.longitude > 180
            ){
                throw new AppError(
                    "Invalid longitude",
                    400
                );
            }

            if(
                data.operatingHours.length !== 7
            ){
                throw new AppError(
                    "All 7 operating days required",
                    400
                );
            }

            const existingRestaurant =
            await this.restaurantRepo
            .findRestaurantByName(
                ownerId,
                data.name
            );

            if(existingRestaurant){
                throw new AppError(
                    "Restaurant already exists",
                    400
                );
            }

            return await prisma.$transaction(
                async(tx)=>{

                    const restaurant =
                    await this.restaurantRepo
                    .createRestaurant(
                        tx,
                        ownerId,
                        data
                    );

                    const branch =
                    await this.restaurantRepo
                    .createBranch(
                        tx,
                        restaurant.id,
                        data
                    );

                    await this.restaurantRepo
                    .createOperatingHours(
                        tx,
                        branch.id,
                        data.operatingHours
                    );

                    return {
                        success: true,
                        message: "Restaurant created successfully",
                        statusCode: 201,
                        data:{      
                        restaurantId:
                            restaurant.id,

                        branchId:
                            branch.id
                    }
                    };
                }
            );

    }


    // Validate Restaurant ownership
    async validateRestaurantOwnership(
    restaurantId:string,
    userId:string
): Promise<ServiceResponse<IRestaurantValidation>>{

    const restaurant =
    await this.restaurantRepo
    .validateRestaurantById(
        restaurantId
    );

    if(!restaurant){
        throw new AppError(
            "Restaurant not found",
            404
        );
    }

    if(restaurant.isDeleted){
        throw new AppError(
            "Restaurant has been deleted",
            404
        );
    }

    if(
        restaurant.ownerId !== userId
    ){
        throw new AppError(
            "Unauthorized access",
            403
        );
    }

    return {
        success: true,
        data: restaurant,
        message: "Restaurant ownership validated successfully",
        statusCode: 200
    };
}

// Update restaurant details
async updateRestaurant(
    restaurantId:string,
    userId:string,
    data:IUpdateRestaurant
): Promise<ServiceResponse<any>>{



        await this.validateRestaurantOwnership(
            restaurantId,
            userId
        );

        if(
            data.gstin &&
            data.gstin.length !== 15
        ){
            throw new AppError(
                "Invalid GSTIN",
                400
            );
        }

        if(
            data.fssaiLicense &&
            data.fssaiLicense.length !== 14
        ){
            throw new AppError(
                "Invalid FSSAI License",
                400 
            );
        }

        if(
            data.latitude &&
            (
                data.latitude < -90 ||
                data.latitude > 90
            )
        ){
            throw new AppError(
                "Invalid latitude",
                400
            );
        }

        if(
            data.longitude &&
            (
                data.longitude < -180 ||
                data.longitude > 180
            )
        ){
            throw new AppError(
                "Invalid longitude",
                400 
            );
        }

        return await prisma.$transaction(
            async(tx)=>{

                const restaurant =
                await this.restaurantRepo
                .updateRestaurant(
                    tx,
                    restaurantId,
                    data
                );

                const primaryBranch =
                await this.restaurantRepo
                .findPrimaryBranchByRestaurantId(
                    restaurantId
                );

                if(!primaryBranch){
                    throw new AppError(
                        "Primary branch not found",
                        404
                    );
                }

                return {
                    success : true,
                    data : restaurant,
                    message : "Restaurant updated successfully",
                    statusCode : 200
                };
            }
        );


}


// Update restaurant status

async updateRestaurantStatus(
    restaurantId: string,
    userId: string,
    isActive: boolean
): Promise<ServiceResponse<any>>{


        const restaurantResponse =
        await this.validateRestaurantOwnership(
            restaurantId,
            userId
        );

        const restaurant = restaurantResponse.data;

        if(!restaurant){
            throw new AppError(
                "Restaurant not found",
                404
            );
        }

        if(
            restaurant.isActive === isActive
        ){
            throw new AppError(
                `Restaurant is already ${
                    isActive
                    ? "active"
                    : "inactive"
                }`,
                400
            );
        }

        const updatedRestaurant =
        await this.restaurantRepo
        .updateRestaurantStatus(
            restaurantId,
            isActive
        );

        return {
            success: true,
            data: updatedRestaurant,
            message: `Restaurant has been ${
                isActive
                ? "activated"
                : "deactivated"
            } successfully`,
            statusCode: 200
        };


}


// Soft delete restaurant

async deleteRestaurant(
    restaurantId: string,
    userId: string
): Promise<ServiceResponse<null>>{



        const restaurantResponse =
        await this.validateRestaurantOwnership(
            restaurantId,
            userId
        );

        const restaurant = restaurantResponse.data;

        if(restaurant?.isDeleted){
            throw new AppError(
                "Restaurant already deleted",
                400
            );
        }

        await this.restaurantRepo
        .softDeleteRestaurant(
            restaurantId
        );

        return {
            success: true,
            data: null,
            message: "Restaurant deleted successfully",
            statusCode: 200
        };


}


// GET restaurant reviews with pagination and average rating

async getRestaurantReviews(
    restaurantId:string,
    page:number,
    limit:number
): Promise<ServiceResponse<any>>{


        await this.validateRestaurant(
            restaurantId
        );

        const reviewData =
        await this.restaurantRepo
        .getRestaurantReviews(
            restaurantId,
            page,
            limit
        );

        const stats =
        await this.restaurantRepo
        .getRestaurantReviewStats(
            restaurantId
        );

        const averageRating = Number(
            (
                (
                    (stats._avg.foodRating ?? 0) +
                    (stats._avg.deliveryRating ?? 0) +
                    (stats._avg.packagingRating ?? 0)
                ) / 3
            ).toFixed(1)
        );

        return {
            success: true,
            data: {
                reviews: reviewData.reviews,
                averageRating,
                pagination: {
                    page,
                    limit,
                    total: reviewData.total
                }
            },
            message: "Restaurant reviews fetched successfully",
            statusCode: 200
        };

    }


// Create Review
async createReview(
    restaurantId:string,
    userId:string,
    data:ICreateReview
): Promise<ServiceResponse<any>>{

        await this.validateRestaurant(
            restaurantId
        );

        const order =
        await this.restaurantRepo
        .findOrderForReview(
            data.orderId
        );

        if(!order){
            throw new AppError(
                "Order not found",
                404
            );
        }

        if(
            order.customerId !== userId
        ){
            throw new AppError(
                "Unauthorized order access",
                403
            );
        }

        if(
            order.branch.restaurantId
            !== restaurantId
        ){
            throw new AppError(
                "Order does not belong to restaurant",
                400
            );
        }

        if(
            order.status !== "DELIVERED"
        ){
            throw new  AppError(
                "Review can only be added after delivery",
                400
            );
        }

        const existingReview =
        await this.restaurantRepo
        .findReviewByOrderId(
            data.orderId
        );

        if(existingReview){
            throw new AppError(
                "Review already submitted",
                400
            );
        }

        if(
            data.foodRating < 1 ||
            data.foodRating > 5
        ){
            throw new AppError(
                "Food rating must be between 1 and 5",
                400
            );
        }

        if(
            data.deliveryRating < 1 ||
            data.deliveryRating > 5
        ){
            throw new AppError(
                "Delivery rating must be between 1 and 5",
                400
            );
        }

        if(
            data.packagingRating < 1 ||
            data.packagingRating > 5
        ){
            throw new AppError(
                "Packaging rating must be between 1 and 5",
                400
            );
        }

        const review =
        await this.restaurantRepo
        .createReview(
            userId,
            order.branchId,
            null,
            data
        );

        return {
            success: true,
            data: review,
            message: "Review created successfully",
            statusCode: 201
        };


}
}