import { RestaurantRepository } from "../repositories/restaurant.repository";
import { UserRepository } from "../../user/repositories/user.repository";
import { IRestaurantValidation, INearbyItem, IPagination, IRestaurantsResult, IBranch } from "../interfaces/restaurant.interface";


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

    const branches: IBranch[] =
    await this.restaurantRepo.getNearbyBranches();

    const filtered: INearbyItem[] =
    branches
    .map((branch: IBranch) => {

        const distance: number =
        this.calculateDistance(
            latitude,
            longitude,
            Number(branch.latitude),
            Number(branch.longitude)
        );

        return {
            branch,
            distance
        } as INearbyItem;
    })

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
}