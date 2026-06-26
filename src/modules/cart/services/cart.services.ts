import { prisma } from "../../../config/prisma";
import { CartRepository } from "../repositories/cart.repository";
import { ServiceResponse } from "../../../common/types/service-response.types";
import { Cart, CartItem, CartModifier } from "../interfaces/cart.interface";
import { CheckoutDetails, CouponSummary, EnrichedCart, EnrichedCartItem } from "../types/cart.types";
import { AddressService } from "../../address/services/address.service";
import { CouponService } from "../../coupons/services/coupon.service";


export class CartService {

    private cartRepo = new CartRepository();
    private addressService = new AddressService();
    private couponService = new CouponService();

    async getCart(
        userId: string
    ): Promise<ServiceResponse<EnrichedCart>> {

        const cart:any =
            await this.cartRepo.getCart(userId);

            console.log("Cart details:", cart);

            if (!cart) {
    return {
      success: true,
      message: "Cart is empty",
      data: {
        userId,
        restaurantBranchId: "",
        items: [],
        subtotal: 0,
      },
      statusCode: 200,
    };
  }

   const menuItemIds = cart.items.map((item: any) => item.menuItemId);

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      isVeg: true,
      isAvailable: true,
      isDeleted: true,
    },
  });

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  const enrichedItems: EnrichedCartItem[] = cart.items.map((item: any) => {
    const dbItem = menuItemMap.get(item.menuItemId);

    return {
      menuItemId: item.menuItemId,
      name: dbItem?.name ?? "Item unavailable",
      description: dbItem?.description ?? null,
      imageUrl: dbItem?.imageUrl ?? null,
      isVeg: dbItem?.isVeg ?? true,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      modifiers: item.modifiers || [],
      specialInstruction: item.specialInstruction,
      itemTotal: item.quantity * item.unitPrice,
      // Flag if item became unavailable since being added to cart
      isCurrentlyAvailable: dbItem
        ? dbItem.isAvailable && !dbItem.isDeleted
        : false,
    };
  });

  const enrichedCart: EnrichedCart = {
    userId: cart.userId,
    restaurantBranchId: cart.restaurantBranchId,
    items: enrichedItems,
    subtotal: cart.subtotal,
  };

  return {
    success: true,
    message: "Cart fetched successfully",
    data: enrichedCart,
    statusCode: 200,
  };
    }

    async addToCart(
        userId: string,
        menuItemId: string,
        quantity: number,
         modifiers: CartModifier[] = [],        // new param — defaults to empty
  specialInstruction?: string,   
    ): Promise<ServiceResponse<EnrichedCart>> {
        if(!quantity) quantity=1
        quantity = Number(quantity);

        console.log("Adding to cart:", menuItemId, quantity);
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
                    branchId: true,
                    price: true,
                },
            });
            console.log("Menu item details:", menuItem);

        if (!menuItem) {
            throw new Error("Menu item not found");
        }

        const branchId = menuItem.branchId;

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


         const menuItemIds = existingCart.items.map((item: any) => item.menuItemId);

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      isVeg: true,
      isAvailable: true,
      isDeleted: true,
    },
  });

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  const enrichedItems: EnrichedCartItem[] = existingCart.items.map((item: any) => {
    const dbItem = menuItemMap.get(item.menuItemId);

    return {
      menuItemId: item.menuItemId,
      name: dbItem?.name ?? "Item unavailable",
      description: dbItem?.description ?? null,
      imageUrl: dbItem?.imageUrl ?? null,
      isVeg: dbItem?.isVeg ?? true,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      modifiers: item.modifiers || [],
      specialInstruction: item.specialInstruction,
      itemTotal: item.quantity * item.unitPrice,
      // Flag if item became unavailable since being added to cart
      isCurrentlyAvailable: dbItem
        ? dbItem.isAvailable && !dbItem.isDeleted
        : false,
    };
  });

  const enrichedCart: EnrichedCart = {
    userId: existingCart.userId,
    restaurantBranchId: existingCart.restaurantBranchId,
    items: enrichedItems,
    subtotal: existingCart.subtotal,
  };

  return {
    success: true,
    message: "Cart fetched successfully",
    data: enrichedCart,
    statusCode: 200,
  };




       
    }

    //will fix later and make + - button and if item quantity is 0 then only delete it from cart 
  async removeCartItem(
    userId: string,
    itemId: string
): Promise<ServiceResponse<EnrichedCart>> {

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

     const menuItemIds = existingCart.items.map((item: any) => item.menuItemId);

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      isVeg: true,
      isAvailable: true,
      isDeleted: true,
    },
  });

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  const enrichedItems: EnrichedCartItem[] = existingCart.items.map((item: any) => {
    const dbItem = menuItemMap.get(item.menuItemId);

    return {
      menuItemId: item.menuItemId,
      name: dbItem?.name ?? "Item unavailable",
      description: dbItem?.description ?? null,
      imageUrl: dbItem?.imageUrl ?? null,
      isVeg: dbItem?.isVeg ?? true,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      modifiers: item.modifiers || [],
      specialInstruction: item.specialInstruction,
      itemTotal: item.quantity * item.unitPrice,
      // Flag if item became unavailable since being added to cart
      isCurrentlyAvailable: dbItem
        ? dbItem.isAvailable && !dbItem.isDeleted
        : false,
    };
  });

  const enrichedCart: EnrichedCart = {
    userId: existingCart.userId,
    restaurantBranchId: existingCart.restaurantBranchId,
    items: enrichedItems,
    subtotal: existingCart.subtotal,
  };

  return {
    success: true,
    message: "Cart fetched successfully",
    data: enrichedCart,
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

    async deleteEntireItemFromCart(
        userId: string,
        itemId: string
    ): Promise<ServiceResponse<EnrichedCart>> {

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
        existingCart.items =
            existingCart.items.filter(
                (cartItem: any) =>
                    cartItem.menuItemId !== itemId
            );

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
                     data: {
            userId,
            restaurantBranchId: null,
            items: [],
            subtotal: 0
        },
                statusCode: 200,
            };
        }

        // Save updated cart

        await this.cartRepo.saveCart(
            userId,
            existingCart
        );

         const menuItemIds = existingCart.items.map((item: any) => item.menuItemId);

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      isVeg: true,
      isAvailable: true,
      isDeleted: true,
    },
  });               
    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));           

    const enrichedItems: EnrichedCartItem[] = existingCart.items.map((item: any) => {   

        const dbItem = menuItemMap.get(item.menuItemId);

        return {
            menuItemId: item.menuItemId,
            name: dbItem?.name ?? "Item unavailable",
            description: dbItem?.description ?? null,
            imageUrl: dbItem?.imageUrl ?? null,
            isVeg: dbItem?.isVeg ?? true,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            modifiers: item.modifiers || [],
            specialInstruction: item.specialInstruction,
            itemTotal: item.quantity * item.unitPrice,
            // Flag if item became unavailable since being added to cart
            isCurrentlyAvailable: dbItem
                ? dbItem.isAvailable && !dbItem.isDeleted
                : false,
        };
    });

    const enrichedCart: EnrichedCart = {
        userId: existingCart.userId,
        restaurantBranchId: existingCart.restaurantBranchId,
        items: enrichedItems,
        subtotal: existingCart.subtotal,
    };

    return {
        success: true,
        message: "Cart fetched successfully",
        data: enrichedCart,
        statusCode: 200,
    };      


}
    
// modules/cart/services/cart.service.ts

async updateItemQuantity(
  userId: string,
  menuItemId: string,
  newQuantity: number,
): Promise<ServiceResponse<EnrichedCart>> {

  const existingCart = await this.cartRepo.getCart(userId);

  if (!existingCart) {
    return {
      success: false,
      error: "Cart not found",
      statusCode: 404,
    };
  }

  const item = existingCart.items.find(
    (i: any) => i.menuItemId === menuItemId
  );

  if (!item) {
    return {
      success: false,
      error: "Item not found in cart",
      statusCode: 404,
    };
  }

  // If new quantity is 0 or negative — remove the item entirely
  if (newQuantity <= 0) {
    return this.removeItemFromCart(userId, menuItemId);
  }

  // Update quantity directly
  item.quantity = newQuantity;

  // Recalculate subtotal
  existingCart.subtotal = existingCart.items.reduce(
    (sum: number, i: any) => sum + Number(i.quantity) * Number(i.unitPrice),
    0
  );

  await this.cartRepo.saveCart(userId, existingCart);

  return this.enrichCart(existingCart);
}


async removeItemFromCart(
  userId: string,
  menuItemId: string,
): Promise<ServiceResponse<EnrichedCart>> {

  const existingCart = await this.cartRepo.getCart(userId);

  if (!existingCart) {
    return {
      success: false,
      error: "Cart not found",
      statusCode: 404,
    };
  }

  const itemExists = existingCart.items.some(
    (i: any) => i.menuItemId === menuItemId
  );

  if (!itemExists) {
    return {
      success: false,
      error: "Item not found in cart",
      statusCode: 404,
    };
  }

  existingCart.items = existingCart.items.filter(
    (i: any) => i.menuItemId !== menuItemId
  );

  existingCart.subtotal = existingCart.items.reduce(
    (sum: number, i: any) => sum + Number(i.quantity) * Number(i.unitPrice),
    0
  );

  // If cart becomes empty after removal — delete the whole cart key
  if (existingCart.items.length === 0) {
    await this.cartRepo.deleteCart(userId);

    return {
      success: true,
      message: "Cart is now empty",
      data: {
        userId,
        restaurantBranchId: "",
        items: [],
        subtotal: 0,
      },
      statusCode: 200,
    };
  }

  await this.cartRepo.saveCart(userId, existingCart);

  return this.enrichCart(existingCart);
}


// ── Shared enrichment helper — avoids duplicating this logic ──
private async enrichCart(cart: any): Promise<ServiceResponse<EnrichedCart>>     {

  const menuItemIds = cart.items.map((i: any) => i.menuItemId);

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      isVeg: true,
      isAvailable: true,
      isDeleted: true,
    },
  });

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  const enrichedItems: EnrichedCartItem[] = cart.items.map((item: any) => {
    const dbItem = menuItemMap.get(item.menuItemId);

    return {
      menuItemId: item.menuItemId,
      name: dbItem?.name ?? "Item unavailable",
      description: dbItem?.description ?? null,
      imageUrl: dbItem?.imageUrl ?? null,
      isVeg: dbItem?.isVeg ?? true,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      modifiers: item.modifiers || [],
      specialInstruction: item.specialInstruction,
      itemTotal: item.quantity * item.unitPrice,
      isCurrentlyAvailable: dbItem
        ? dbItem.isAvailable && !dbItem.isDeleted
        : false,
    };
  });

  return {
    success: true,
    message: "Cart updated successfully",
    data: {
      userId: cart.userId,
      restaurantBranchId: cart.restaurantBranchId,
      items: enrichedItems,
      subtotal: cart.subtotal,
    },
    statusCode: 200,
  };
}   

    // modules/cart/services/cart.service.ts

async getCheckoutDetails(
  userId: string
): Promise<ServiceResponse<CheckoutDetails>> {

  // 1. Get cart first — we need subtotal to check coupon eligibility
  const cartResult = await this.getCart(userId);

  if (!cartResult.success || !cartResult.data) {
    return {
      success: false,
      error: "Cart not found or empty",
      statusCode: 404,
    };
  }

  const cart = cartResult.data;

  // 2. Fetch addresses and coupons in parallel
  const [addressesResult, couponsResult] = await Promise.all([
    this.addressService.getAddresses(userId),
    this.couponService.getActiveCoupons(),
  ]);

  if (!addressesResult.success) {
    return {
      success: false,
      error: addressesResult.error || "Failed to fetch addresses",
      statusCode: addressesResult.statusCode,
    };
  }

  if (!couponsResult.success) {
    return {
      success: false,
      error: couponsResult.error || "Failed to fetch coupons",
      statusCode: couponsResult.statusCode,
    };
  }

  const addresses = addressesResult.data || [];
  const coupons = couponsResult.data || [];

  // 3. Find default address
  const defaultAddress = addresses.find((a: any) => a.isDefault);

  // 4. Mark coupon eligibility based on cart subtotal
  const couponsWithEligibility: CouponSummary[] = coupons.map((coupon: any) => {
    const minOrderAmount = coupon.minOrderAmount
      ? Number(coupon.minOrderAmount)
      : null;

    const isEligible = minOrderAmount
      ? cart.subtotal >= minOrderAmount
      : true;

    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      discountValue: Number(coupon.discountValue),
      minOrderAmount,
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      isEligible,
      ...(!isEligible && {
        reasonIfNotEligible: `Add items worth ₹${(minOrderAmount! - cart.subtotal).toFixed(2)} more to use this coupon`,
      }),
    };
  });

  return {
    success: true,
    message: "Checkout details fetched successfully",
    data: {
      cart,
      addresses: addresses.map((a: any) => ({
        id: a.id,
        label: a.label,
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        isDefault: a.isDefault,
      })),
      defaultAddressId: defaultAddress?.id ?? null,
      availableCoupons: couponsWithEligibility,
    },
    statusCode: 200,
  };
}
    
     

}