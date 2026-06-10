// services/order.service.ts
import { PrismaClient, PaymentMethodType } from "@prisma/client";
import { ServiceResponse } from "../../../common/types/service-response.types";
import { CartService } from "../../cart/services/cart.services";
import { AddressService } from "../../address/services/address.service";
// import { CreateOrderInput, OrderItemInput } from "../types/order.types";

export class OrderService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cartService: CartService,
    private readonly addressService: AddressService,
  ) {}

  async createOrder(
    input: CreateOrderInput
  ): Promise<ServiceResponse<any>> {
    const { userId, addressId, paymentMethod, couponCode, scheduledAt } = input;

    try {
      // ── 1. Get cart from Redis ──────────────────────────────
      const cartResponse = await this.cartService.getCart(userId);
      if (!cartResponse.success || !cartResponse.data) {
        return {
          success: false,
          error: "Cart not found",
          statusCode: 404,
        };
      }

      const cart = cartResponse.data;

      // ── 2. Validate cart is not empty ───────────────────────
      if (!cart.items || cart.items.length === 0) {
        return {
          success: false,
          error: "Cart is empty",
          statusCode: 400,
        };
      }

      // ── 3. Validate address belongs to this user ────────────
      const address = await this.prisma.userAddress.findFirst({
        where: {
          id: addressId,
          userId: userId,
          isDeleted: false,
        },
      });
      if (!address) {
        return {
          success: false,
          error: "Address not found or does not belong to this user",
          statusCode: 404,
        };
      }

      // ── 4. Validate branch is active ────────────────────────
      const branch = await this.prisma.restaurantBranch.findFirst({
        where: {
          id: cart.restaurantBranchId,
          isActive: true,
          isDeleted: false,
        },
      });
      if (!branch) {
        return {
          success: false,
          error: "Restaurant branch not found or inactive",
          statusCode: 404,
        };
      }

      // ── 5. Fetch ALL menu items in one query (not in a loop) ─
      const menuItemIds = cart.items.map((i: any) => i.menuItemId);

      const menuItems = await this.prisma.menuItem.findMany({
        where: {
          id: { in: menuItemIds },
          branch_id: cart.restaurantBranchId,
          isAvailable: true,
          isDeleted: false,
        },
      });

      // Check every cart item has a valid DB record
      if (menuItems.length !== menuItemIds.length) {
        const foundIds = new Set(menuItems.map((m) => m.id));
        const missingId = menuItemIds.find((id: string) => !foundIds.has(id));
        return {
          success: false,
          error: `Menu item ${missingId} is unavailable or not found`,
          statusCode: 400,
        };
      }

      const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

      // ── 6. Build order items + calculate subtotal ────────────
      // Prices come from DB — never from Redis cart
      let subtotal = 0;
      const orderItems: OrderItemInput[] = [];

      for (const cartItem of cart.items) {
        const dbItem = menuItemMap.get(cartItem.menuItemId)!;
        const basePrice = Number(dbItem.price);

        const modifiers = cartItem.modifiers || [];
        const modifierTotal = modifiers.reduce(
          (sum: number, mod: any) => sum + Number(mod.extraPrice),
          0
        );

        const unitPrice = basePrice + modifierTotal;
        const itemTotal = unitPrice * cartItem.quantity;
        subtotal += itemTotal;

        orderItems.push({
          menuItemId: dbItem.id,
          menuItemName: dbItem.name!,       // snapshot — required by schema
          quantity: cartItem.quantity,
          unitPrice,                         // snapshot — price at time of order
          specialInstruction: cartItem.specialInstruction ?? null,
          modifiers: modifiers.map((mod: any) => ({
            modifierName: mod.modifierName,  // snapshot
            extraPrice: Number(mod.extraPrice),
          })),
        });
      }

      // ── 7. Calculate charges ─────────────────────────────────
      const TAX_RATE = 0.05;
      const DELIVERY_FEE = 40;
      const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2));
      const deliveryFee = DELIVERY_FEE;
      let discountAmount = 0;
      let couponId: string | null = null;

      // ── 8. Validate and apply coupon ─────────────────────────
      if (couponCode) {
        const coupon = await this.prisma.coupon.findFirst({
          where: {
            code: couponCode,
            isActive: true,
            isDeleted: false,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        });

        if (!coupon) {
          return {
            success: false,
            error: "Invalid or expired coupon",
            statusCode: 400,
          };
        }

        // Check minimum order amount
        if (
          coupon.minOrderAmount &&
          subtotal < Number(coupon.minOrderAmount)
        ) {
          return {
            success: false,
            error: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`,
            statusCode: 400,
          };
        }

        // Check global usage limit
        if (coupon.usageLimit) {
          const usageCount = await this.prisma.couponUsage.count({
            where: { couponId: coupon.id },
          });
          if (usageCount >= coupon.usageLimit) {
            return {
              success: false,
              error: "Coupon usage limit has been reached",
              statusCode: 400,
            };
          }
        }

        // Calculate discount based on coupon type
        if (coupon.type === "PERCENTAGE") {
          discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
          if (coupon.maxDiscount) {
            discountAmount = Math.min(
              discountAmount,
              Number(coupon.maxDiscount)
            );
          }
        } else if (coupon.type === "FLAT") {
          discountAmount = Number(coupon.discountValue);
        } else if (coupon.type === "FREE_DELIVERY") {
          discountAmount = deliveryFee;
        }

        discountAmount = parseFloat(discountAmount.toFixed(2));
        couponId = coupon.id;
      }

      const totalAmount = parseFloat(
        (subtotal + taxAmount + deliveryFee - discountAmount).toFixed(2)
      );

      // ── 9. Generate order number ─────────────────────────────
      const orderNumber = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      // ── 10. Prisma transaction ───────────────────────────────
      // All DB writes happen here — if anything fails, everything rolls back
      const order = await this.prisma.$transaction(async (tx) => {

        // 10a. Create Order row
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            customerId: userId,
            branchId: cart.restaurantBranchId,
            addressId,
            couponId,
            subtotal,
            taxAmount,
            deliveryFee,
            discountAmount,
            totalAmount,
            status: "PLACED",
            paymentStatus: "PENDING",
            placedAt: new Date(),
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          },
        });

        // 10b. Create OrderItems + their modifiers
        for (const item of orderItems) {
          const orderItem = await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              menuItemId: item.menuItemId,
              menuItemName: item.menuItemName,
              price: item.unitPrice,
              quantity: item.quantity,
              specialInstruction: item.specialInstruction ?? null,
            },
          });

          // 10c. Create modifiers for this order item
          if (item.modifiers.length > 0) {
            await tx.orderItemModifier.createMany({
              data: item.modifiers.map((mod:any) => ({
                orderItemId: orderItem.id,
                modifierName: mod.modifierName,
                extraPrice: mod.extraPrice,
              })),
            });
          }
        }

        // 10d. Record initial status history entry
        await tx.orderStatusHistory.create({
          data: {
            orderId: newOrder.id,
            oldStatus: null,
            newStatus: "PLACED",
            changedBy: userId,
            changedAt: new Date(),
          },
        });

        // 10e. Record coupon usage
        if (couponId) {
          await tx.couponUsage.create({
            data: {
              couponId,
              customerId: userId,
              orderId: newOrder.id,
              usedAt: new Date(),
            },
          });
        }

        // 10f. Create Payment record (gateway call happens separately)
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            paymentMethod: paymentMethod as PaymentMethodType,
            amount: totalAmount,
            status: "PENDING",
          },
        });

        // 10g. Create Delivery record
        await tx.delivery.create({
          data: {
            orderId: newOrder.id,
            status: "PENDING",
          },
        });

        return newOrder;
      });

      // ── 11. Clear cart from Redis AFTER successful transaction ─
      await this.cartService.clearCart(userId);

      // ── 12. Return response ──────────────────────────────────
      return {
        success: true,
        message: "Order placed successfully",
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          subtotal,
          taxAmount,
          deliveryFee,
          discountAmount,
          totalAmount,
          status: "PLACED",
          paymentStatus: "PENDING",
        },
        statusCode: 201,
      };

    } catch (error: any) {
      console.error("createOrder error:", error);
      return {
        success: false,
        error: "Failed to place order. Please try again.",
        statusCode: 500,
      };
    }
  }
}