import { CartRepository } from "../repositories/cart.repository";
import { UserRepository } from "../../user/repositories/user.repository";
// import {  } from "../interfaces/restaurant.interface";
import { RestaurantRepository } from "../../restaurant/repositories/restaurant.repository";
import { prisma } from "../../../config/prisma";


export class CartService {

    private cartRepo: CartRepository = new CartRepository();
    private userRepo: UserRepository = new UserRepository();


    async getCart(userId: number) {
        const userCart = await this.cartRepo.getCart(userId);

    }

    async addToCart(userId: number, menuItemId: string, quantity: number) {

        //first i have to check from redis that if this user has any cart or not



        //now i have to find the restaurant brnach fromt he menuId

        const menuItem: any = await prisma.menuItem.findUnique({
            where: {
                id: menuItemId, //varchar in db
            },
            select: {
                branch_id: true,
                price: true,
            },
        });

        if (!menuItem) {
        throw new Error("Menu item not found");
    }

        const branchId = menuItem?.branch_id;

        const existingCart = await this.cartRepo.getCart(userId);

        console.log(existingCart,"this is exiswting cart from redis");
        let newCart;

             //now we have to check if the user has cart or not if not then we will create a new one 
        // and if user has a cart then we will check if the new itemId belongs to the same branch or not 

        if (!existingCart) {
            newCart = {
                userId,
                restaurantBranchId: branchId,
                items: [
                    {
                        menuItemId,
                        quantity,
                        unitPrice: menuItem.price,
                    },
                ],
                subtotal: quantity * menuItem.price,
            };

            await this.cartRepo.saveCart(userId,newCart);

            return newCart; // then return from here only
        }

        //now cart is already there

        if(branchId !== existingCart.restaurantBranchId){
             throw new Error(
            "Cart contains items from another restaurant branch"
        );
        }

        //now check if the menuItem already exists
        const existingItem =
        existingCart.items.find(
            (item: any) =>
                item.menuItemId === menuItemId
        );

    // update quantity if item exists

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        existingCart.items.push({
            menuItemId,
            quantity,
            unitPrice: Number(menuItem.price),
        });
    }
    
     existingCart.subtotal =
        existingCart.items.reduce(
            (sum: number, item: any) =>
                sum +
                item.quantity * item.unitPrice,
            0
        );

         await this.cartRepo.saveCart(userId, existingCart);

         return existingCart

    }

    async removeCartItem(userId: number, itemId: string) {

        const existingCart = await this.cartRepo.getCart(userId);


        //this is to find that if the user has actually a cart in his profile
        if (!existingCart) {
            throw new Error("Cart not found");
        }

        //now lets say user has cart then wer will find the item from the item id in redis

        const itemToBeRemoved = existingCart.items.find((item: any) => item.menuItemId === itemId);

        if (!itemToBeRemoved) {
            throw new Error("Item not found in cart");
        }           

        //if item is there then we will remove that item from the cart and update the subtotal

        existingCart.items = existingCart.items.filter((item: any) => item.menuItemId !== itemId);
        
    
        
    
    
    
    }

}