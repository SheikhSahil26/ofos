import { prisma } from "../../../config/prisma";
import { CartRepository } from "../repositories/cart.repository";
import { ServiceResponse } from "../../../common/types/service-response.types";
import { Cart, CartItem, CartModifier } from "../interfaces/cart.interface";



export class CartService {

    private cartRepo = new CartRepository();

    async getCart(
        userId: string
    ): Promise<ServiceResponse<Cart>> {

        const cart =
            await this.cartRepo.getCart(userId);

        if (!cart) {
            return {
                success: false,
                error: "Cart not found",
                statusCode: 404,
            };
        }

        return {
            success: true,
            message: "Cart fetched successfully",
            data: cart,
            statusCode: 200,
        };
    }

    async addToCart(
        userId: string,
        menuItemId: string,
        quantity: number,
         modifiers: CartModifier[] = [],        // new param — defaults to empty
  specialInstruction?: string,   
    ): Promise<ServiceResponse<Cart>> {

        quantity = Number(quantity);

        console.log(menuItemId, quantity) ;
        console.log(
    "typeof:",
    typeof menuItemId
);

        const menuItem =
            await prisma.menuItem.findUnique({
                where: {
                    id: menuItemId,
                },
                select: {
                    branch_id: true,
                    price: true,
                },
            });
            console.log("Menu item details:", menuItem);

        if (!menuItem) {
            throw new Error("Menu item not found");
        }

        const branchId = menuItem.branch_id;

        const existingCart =
            await this.cartRepo.getCart(
                userId
            );

        if (!existingCart) {

            const newCart = {
                userId,
                restaurantBranchId:
                    branchId,
                items: [
                    {
                        menuItemId,
                        quantity,
                        unitPrice:
                            Number(
                                menuItem.price
                            ),
                        modifiers,
                       specialInstruction:specialInstruction as any,
                    },
                ],
                subtotal:
                    quantity *
                    Number(
                        menuItem.price
                    ),
            };

            await this.cartRepo.saveCart(
                userId,
                newCart
            );

            return {
                success: true,
                message:
                    "Item added to cart successfully",
                data: newCart,
                statusCode: 201,
            };
        }

        if (
            branchId !==
            existingCart.restaurantBranchId
        ) {
            throw new Error(
                "Cart contains items from another restaurant branch"
            );
        }

        const existingItem =
            existingCart.items.find(
                (item: any) =>
                    item.menuItemId ===
                    menuItemId
            );

        if (existingItem) {

            existingItem.quantity =
                Number(
                    existingItem.quantity
                ) + quantity;

        } else {

            existingCart.items.push({
                menuItemId,
                quantity,
                unitPrice:
                    Number(
                        menuItem.price
                    ),
                modifiers,
               specialInstruction:specialInstruction as any,
            });
        }

        existingCart.subtotal =
            existingCart.items.reduce(
                (
                    sum: number,
                    item: any
                ) =>
                    sum +
                    Number(
                        item.quantity
                    ) *
                    Number(
                        item.unitPrice
                    ),
                0
            );

        await this.cartRepo.saveCart(
            userId,
            existingCart
        );

        return {
            success: true,
            message: "Item added to cart successfully",
            data: existingCart,
            statusCode: 200,
        };
    }

    //will fix later and make + - button and if item quantity is 0 then only delete it from cart 
  async removeCartItem(
    userId: string,
    itemId: string
): Promise<ServiceResponse<any>> {

    const existingCart =
        await this.cartRepo.getCart(userId);

    if (!existingCart) {
        throw new Error(
            "Cart not found"
        );
    }

    const item =
        existingCart.items.find(
            (item: any) =>
                item.menuItemId === itemId
        );

    if (!item) {
        throw new Error(
            "Item not found in cart"
        );
    }

    // Decrement quantity

    item.quantity =
        Number(item.quantity) - 1;

    // Remove item only when quantity becomes 0

    if (item.quantity <= 0) {

        existingCart.items =
            existingCart.items.filter(
                (cartItem: any) =>
                    cartItem.menuItemId !== itemId
            );
    }

    // Recalculate subtotal

    existingCart.subtotal =
        existingCart.items.reduce(
            (
                sum: number,
                item: any
            ) =>
                sum +
                Number(item.quantity) *
                Number(item.unitPrice),
            0
        );

    // If cart becomes empty

    if (
        existingCart.items.length === 0
    ) {

        await this.cartRepo.deleteCart(
            userId
        );

        return {
            success: true,
            message:
                "Cart deleted successfully",
            statusCode: 200,
        };
    }

    // Save updated cart

    await this.cartRepo.saveCart(
        userId,
        existingCart
    );

    return {
        success: true,
        message:
            "Item quantity updated successfully",
        data: existingCart,
        statusCode: 200,
    };
}

    //delete entire cart 

    async clearCart(
        userId: string
    ): Promise<ServiceResponse<any>> {
        const existingCart =  await this.cartRepo.getCart(userId);

        if (!existingCart) {
            throw new Error(
                "Cart not found"
            );
        }

        await this.cartRepo.deleteCart(userId);

        return {
            success: true,
            message: "Cart cleared successfully",
            statusCode: 200,
        };

     }

     async validateCart(
    userId: string
): Promise<ServiceResponse<any>> {

    const cart =
        await this.cartRepo.getCart(
            userId
        );

    if (!cart) {
        throw new Error(
            "Cart not found"
        );
    }

    const menuItemIds =
        cart.items.map(
            (item: any) =>
                item.menuItemId
        );

    const menuItems =
        await this.cartRepo.getMenuItemsByIds(
            menuItemIds
        );

    const issues: any[] = [];

    for (const cartItem of cart.items) {

        const dbItem =
            menuItems.find(
                (item: any) =>
                    item.id ===
                    cartItem.menuItemId
            );

        // Item deleted

        if (!dbItem) {

            issues.push({
                menuItemId:
                    cartItem.menuItemId,
                issue:
                    "Menu item not found",
            });

            continue;
        }

        // Soft deleted

        if (dbItem.isDeleted) {

            issues.push({
                menuItemId:
                    cartItem.menuItemId,
                issue:
                    "Menu item deleted",
            });

            continue;
        }

        // Unavailable

        if (!dbItem.isAvailable) {

            issues.push({
                menuItemId:
                    cartItem.menuItemId,
                issue:
                    "Item unavailable",
            });

            continue;
        }

        // Price changed

        if (
            Number(
                dbItem.price
            ) !==
            Number(
                cartItem.unitPrice
            )
        ) {

            issues.push({
                menuItemId:
                    cartItem.menuItemId,
                issue:
                    `Price changed from ₹${cartItem.unitPrice} to ₹${dbItem.price}`,
            });
        }
    }

    if (issues.length > 0) {

        return {
            success: false,
            message:
                "Cart validation failed",
            data: {
                valid: false,
                issues,
            },
            statusCode: 400,
        };
    }

    return {
        success: true,
        message:
            "Cart validation successful",
        data: {
            valid: true,
        },
        statusCode: 200,
    };
}

    async getCartSummary(
    userId: string
): Promise<ServiceResponse<any>> {

    const cart =
        await this.cartRepo.getCart(
            userId
        );

    if (!cart) {
        throw new Error(
            "Cart not found"
        );
    }

    const subtotal =
        Number(cart.subtotal);

    // Example calculations
    const tax =
        Number(
            (subtotal * 0.05).toFixed(2)
        );

    const deliveryFee =
        subtotal >= 500
            ? 0
            : 40;

    const discount = 0;

    const total =
        subtotal +
        tax +
        deliveryFee -
        discount;

    return {
        success: true,
        message:
            "Cart summary fetched successfully",
        data: {
            subtotal,
            tax,
            deliveryFee,
            discount,
            total,
        },
        statusCode: 200,
    };
}


}