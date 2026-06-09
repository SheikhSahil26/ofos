import { RestaurantRepository } from "../repositories/restaurant.repository";
import { UserRepository } from "../../user/repositories/user.repository";
import { IRestaurantValidation, INearbyItem, IPagination, IRestaurantsResult, IBranch, ICreateRestaurant, IUpdateRestaurant, ICreateReview } from "../interfaces/restaurant.interface";
import { prisma } from "../../../config/prisma";


export class RestaurantService{

    private restaurantRepo: RestaurantRepository = new RestaurantRepository();
    private userRepo: UserRepository = new UserRepository();

    //get all restaurants
   async getRestaurants(
    page: number,
    limit: number,
    search?: string
): Promise<{ data: any[]; pagination: IPagination }> {

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
        data:data.restaurants,

        pagination:{
            page,
            limit,
            total:data.total
        }
    };
}


    //GET owner restaurants
   async getMyRestaurants(
    ownerId: string,
    page: number,
    limit: number
): Promise<{ data: any[]; pagination: IPagination }> {

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
        data:data.restaurants,

        pagination:{
            page,
            limit,
            total:data.total
        }
    };
}

    //GET nearby restaurants
   async getNearbyRestaurants(
    latitude: number,
    longitude: number,
    radius: number
): Promise<INearbyItem[]> {

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

    return filtered;
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
): Promise<IRestaurantValidation>{

    try{

        const restaurant =
        await this.restaurantRepo
        .validateRestaurantById(
            restaurantId
        );

        if(!restaurant){
            throw new Error(
                "Restaurant not found"
            );
        }

        if(restaurant.isDeleted){
            throw new Error(
                "Restaurant has been deleted"
            );
        }

        return restaurant;

    }
    catch(err){
        throw err;
    }
}

//create restaurant
 async createRestaurant(
        ownerId:string,
        data:ICreateRestaurant
    ){

        try{

            const owner =
            await this.userRepo
            .findUserById(ownerId);

            if(!owner){
                throw new Error(
                    "Owner not found"
                );
            }

            if(owner.isDeleted){
                throw new Error(
                    "Owner account deleted"
                );
            }

            if(!data.name?.trim()){
                throw new Error(
                    "Restaurant name is required"
                );
            }

            if(!data.branchName?.trim()){
                throw new Error(
                    "Branch name is required"
                );
            }

            if(data.gstin.length !== 15){
                throw new Error(
                    "Invalid GSTIN"
                );
            }

            if(data.fssaiLicense.length !== 14){
                throw new Error(
                    "Invalid FSSAI License"
                );
            }

            if(
                data.latitude < -90 ||
                data.latitude > 90
            ){
                throw new Error(
                    "Invalid latitude"
                );
            }

            if(
                data.longitude < -180 ||
                data.longitude > 180
            ){
                throw new Error(
                    "Invalid longitude"
                );
            }

            if(
                data.operatingHours.length !== 7
            ){
                throw new Error(
                    "All 7 operating days required"
                );
            }

            const existingRestaurant =
            await this.restaurantRepo
            .findRestaurantByName(
                ownerId,
                data.name
            );

            if(existingRestaurant){
                throw new Error(
                    "Restaurant already exists"
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
                        restaurantId:
                            restaurant.id,

                        branchId:
                            branch.id
                    };
                }
            );

        }
        catch(err){
            throw err;
        }
    }


    // Validate Restaurant ownership
    async validateRestaurantOwnership(
    restaurantId:string,
    userId:string
){

    const restaurant =
    await this.restaurantRepo
    .validateRestaurantById(
        restaurantId
    );

    if(!restaurant){
        throw new Error(
            "Restaurant not found"
        );
    }

    if(restaurant.isDeleted){
        throw new Error(
            "Restaurant has been deleted"
        );
    }

    if(
        restaurant.ownerId !== userId
    ){
        throw new Error(
            "Unauthorized access"
        );
    }

    return restaurant;
}

// Update restaurant details
async updateRestaurant(
    restaurantId:string,
    userId:string,
    data:IUpdateRestaurant
){

    try{

        await this.validateRestaurantOwnership(
            restaurantId,
            userId
        );

        if(
            data.gstin &&
            data.gstin.length !== 15
        ){
            throw new Error(
                "Invalid GSTIN"
            );
        }

        if(
            data.fssaiLicense &&
            data.fssaiLicense.length !== 14
        ){
            throw new Error(
                "Invalid FSSAI License"
            );
        }

        if(
            data.latitude &&
            (
                data.latitude < -90 ||
                data.latitude > 90
            )
        ){
            throw new Error(
                "Invalid latitude"
            );
        }

        if(
            data.longitude &&
            (
                data.longitude < -180 ||
                data.longitude > 180
            )
        ){
            throw new Error(
                "Invalid longitude"
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
                    throw new Error(
                        "Primary branch not found"
                    );
                }

                return restaurant;
            }
        );

    }
    catch(err){
        throw err;
    }
}


// Update restaurant status

async updateRestaurantStatus(
    restaurantId: string,
    userId: string,
    isActive: boolean
){

    try{

        const restaurant =
        await this.validateRestaurantOwnership(
            restaurantId,
            userId
        );

        if(
            restaurant.isActive === isActive
        ){
            throw new Error(
                `Restaurant is already ${
                    isActive
                    ? "active"
                    : "inactive"
                }`
            );
        }

        return await this.restaurantRepo
        .updateRestaurantStatus(
            restaurantId,
            isActive
        );

    }
    catch(err){
        throw err;
    }
}


// Soft delete restaurant

// restaurant.service.ts

async deleteRestaurant(
    restaurantId: string,
    userId: string
){

    try{

        const restaurant =
        await this.validateRestaurantOwnership(
            restaurantId,
            userId
        );

        if(restaurant.isDeleted){
            throw new Error(
                "Restaurant already deleted"
            );
        }

        await this.restaurantRepo
        .softDeleteRestaurant(
            restaurantId
        );

        return;

    }
    catch(err){
        throw err;
    }
}


// GET restaurant reviews with pagination and average rating

async getRestaurantReviews(
    restaurantId:string,
    page:number,
    limit:number
){

    try{

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

            reviews:
            reviewData.reviews,

            averageRating,

            pagination:{
                page,
                limit,
                total:
                reviewData.total
            }
        };

    }
    catch(err){
        throw err;
    }
}


// Create Review
async createReview(
    restaurantId:string,
    userId:string,
    data:ICreateReview
){

    try{

        await this.validateRestaurant(
            restaurantId
        );

        const order =
        await this.restaurantRepo
        .findOrderForReview(
            data.orderId
        );

        if(!order){
            throw new Error(
                "Order not found"
            );
        }

        if(
            order.customerId !== userId
        ){
            throw new Error(
                "Unauthorized order access"
            );
        }

        if(
            order.branch.restaurantId
            !== restaurantId
        ){
            throw new Error(
                "Order does not belong to restaurant"
            );
        }

        if(
            order.status !== "DELIVERED"
        ){
            throw new Error(
                "Review can only be added after delivery"
            );
        }

        const existingReview =
        await this.restaurantRepo
        .findReviewByOrderId(
            data.orderId
        );

        if(existingReview){
            throw new Error(
                "Review already submitted"
            );
        }

        if(
            data.foodRating < 1 ||
            data.foodRating > 5
        ){
            throw new Error(
                "Food rating must be between 1 and 5"
            );
        }

        if(
            data.deliveryRating < 1 ||
            data.deliveryRating > 5
        ){
            throw new Error(
                "Delivery rating must be between 1 and 5"
            );
        }

        if(
            data.packagingRating < 1 ||
            data.packagingRating > 5
        ){
            throw new Error(
                "Packaging rating must be between 1 and 5"
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

        return review;

    }
    catch(err){
        throw err;
    }
}
}