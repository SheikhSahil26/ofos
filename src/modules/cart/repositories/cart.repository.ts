// import { IExistingRestaurant, IRestaurantValidation } from "../interfaces/restaurant.interface";
import { prisma } from "../../../config/prisma";
import redisClient from "../../../config/redis";

export class CartRepository {
  // get cart details by id
    async getCart(userId: number) {

        const userCart = await redisClient.get(`cart:${userId}`);

        //currently avoiding all checks just assuming everythign works fine
        if(userCart){
            return JSON.parse(userCart);
        }

        return null;

      }
    async saveCart(userId:number, cartData: any) {

        await redisClient.set(`cart:${userId}`, JSON.stringify(cartData));

        const savedCart = await this.getCart(userId);
        console.log("Saved cart in Redis:", savedCart);

        

        
    }

}
