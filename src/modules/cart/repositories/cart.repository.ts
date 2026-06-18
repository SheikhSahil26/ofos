// import { IExistingRestaurant, IRestaurantValidation } from "../interfaces/restaurant.interface";
import { prisma } from "../../../config/prisma";
import redisClient from "../../../config/redis";
import { Cart } from "../interfaces/cart.interface";

export class CartRepository {
  // get cart details by id
  private getCartKey(userId: string): string {
        return `cart:${userId}`;
    }

    async getCart(
        userId: string
    ): Promise<Cart | null> {

        const cart =
            await redisClient.get(
                this.getCartKey(userId)
            );

            
        

        if (!cart) {
            return null;
        }

        return JSON.parse(cart);
    }

    async saveCart(
        userId: string,
        cartData: Cart
    ): Promise<void> {

        await redisClient.set(
            this.getCartKey(userId),
            JSON.stringify(cartData)
        );
    }

    async deleteCart(
        userId: string
    ): Promise<void> {

        await redisClient.del(
            this.getCartKey(userId)
        );
    }

  async getMenuItemsByIds(
    menuItemIds: string[]
) {

    return prisma.menuItem.findMany({
        where: {
            id: {
                in: menuItemIds,
            },
        },
        select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true,
            isDeleted: true,
            branch_id: true,
        },
    });
}
    
}
