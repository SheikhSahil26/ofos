import { RestaurantService } from "../services/restaurant.service";

export class RestaurantController{

    private restaurantService = new RestaurantService(); 

    //get all restaurants
    async getAllRestaurants(): Promise<void>{
        try{

        }
        catch(err){
            throw err;
        }
    }


    //get restaurant by id
    async getRestaurantById(restaurantId: string): Promise<void>{
        try{

        }
        catch(err){
            throw err;
        }
    }

    //create restaurant
    async createRestaurant(data: any): Promise<void>{
        try{

        }
        catch(err){
            throw err;
        }
    }
}