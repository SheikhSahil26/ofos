// services/order.service.ts
import { PrismaClient, PaymentMethodType, Order } from "@prisma/client";
import { ServiceResponse } from "../../../common/types/service-response.types";
import { CartService } from "../../cart/services/cart.services";
import { AddressService } from "../../address/services/address.service";
import { OrdersRepository } from "../repositories/orders.repository";
import { DELIVERY_TRANSITIONS, STAFF_TRANSITIONS } from "../types/order.types";
import { OrderItemInput } from "../interfaces/orders.interface";
import { PayoutService } from "../../payout-managment/services/payout.service";
import { prisma } from "../../../config/prisma";
import { DeliveryService } from "../../delivery/services/delivery.service";
import { OrderAssignmentService } from "./orderAssignment.service";
// import { CreateOrderInput, OrderItemInput } from "../types/order.types";

export class OrderService {
  private orderRepo = new OrdersRepository();
  // Assuming you have a DeliveryService class
  private orderAssignmentService = new OrderAssignmentService();
  
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cartService: CartService,
    private readonly addressService: AddressService,
  ) { }

  private payoutService = new PayoutService(prisma);

  async createOrder(
    userId: string,
    addressId: string,
    paymentMethod: string,
    couponCode?: string,
    scheduledAt?: string,
  ): Promise<ServiceResponse<any>> {


    // ── 1. Get cart from Redis ──────────────────────────────────
    const cartResponse = await this.cartService.getCart(userId);

    if (!cartResponse.success || !cartResponse.data) {
      return {
        success: false,
        error: "Cart not found",
        statusCode: 404,
      };
    }

    const cart = cartResponse.data;

    console.log("Cart fetched for order creation:", cart);
    // cart shape:
    // {
    //   userId: 1,
    //   restaurantBranchId: "uuid",
    //   items: [{ menuItemId, quantity, unitPrice }],
    //   subtotal: 792
    // }

    // ── 2. Validate cart is not empty ───────────────────────────
    if (!cart.items || cart.items.length === 0) {
      return {
        success: false,
        error: "Cart is empty",
        statusCode: 400,
      };
    }

    const activeOrder = await this.prisma.order.findFirst({
    where: {
      customerId: userId,
      status: {
        notIn: ["DELIVERED", "CANCELLED"], // anything not finished or cancelled counts as active
      },
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
    },
  });

  if (activeOrder) {
    return {
      success: false,
      error: `You already have an active order (#${activeOrder.orderNumber}) in ${activeOrder.status.replace(/_/g, " ")} status. Please wait for it to be delivered before placing a new order.`,
      statusCode: 409,
    };
  }





    const branchId = cart.restaurantBranchId;

    if (!branchId) {
      return {
        success: false,
        error: "Cart restaurant branch is missing",
        statusCode: 400,
      };
    }

    const normalizedPaymentMethod = paymentMethod.toUpperCase() as PaymentMethodType;

    if (!Object.values(PaymentMethodType).includes(normalizedPaymentMethod)) {
      return {
        success: false,
        error: "Invalid payment method",
        statusCode: 400,
      };
    }

    const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;

    if (scheduledAt && Number.isNaN(scheduledDate?.getTime())) {
      return {
        success: false,
        error: "Invalid scheduledAt date",
        statusCode: 400,
      };
    }

    // ── 3. Validate address belongs to this user ────────────────
    // userId from cart is number — convert to string for Prisma
    const userIdStr = String(userId);

    const address = await this.prisma.userAddress.findFirst({
      where: {
        id: addressId,
        userId: userIdStr,
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

    // ── 4. Validate branch is active ────────────────────────────
    const branch = await this.prisma.restaurantBranch.findFirst({
      where: {
        id: branchId,
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

    // ── 5. Fetch ALL menu items in one query ────────────────────
    const menuItemIds = [
      ...new Set(cart.items.map((item: any) => item.menuItemId).filter(Boolean)),
    ];

    if (menuItemIds.length === 0) {
      return {
        success: false,
        error: "Cart has no valid menu items",
        statusCode: 400,
      };
    }

    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        branchId,
        isAvailable: true,
        isDeleted: false,
      },
    });

    // Every cart item must have a valid DB record
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

    // ── 6. Build order items + calculate subtotal ───────────────
    // Prices ALWAYS come from DB — never trust cart unitPrice
    let subtotal = 0;
    const orderItems: OrderItemInput[] = [];

    for (const cartItem of cart.items) {
      const dbItem = menuItemMap.get(cartItem.menuItemId);

      // Safety check — should never happen after step 5 but guard anyway
      if (!dbItem) {
        return {
          success: false,
          error: `Menu item ${cartItem.menuItemId} not found`,
          statusCode: 400,
        };
      }

      if (dbItem.price === null) {
        return {
          success: false,
          error: `Menu item ${cartItem.menuItemId} does not have a price`,
          statusCode: 400,
        };
      }

      if (!Number.isInteger(cartItem.quantity) || cartItem.quantity <= 0) {
        return {
          success: false,
          error: `Invalid quantity for menu item ${cartItem.menuItemId}`,
          statusCode: 400,
        };
      }

      const basePrice = Number(dbItem.price);

      const modifiers = (cartItem.modifiers || []).map((mod: any) => ({
        modifierName: mod.modifierName ?? mod.name ?? "Modifier",
        extraPrice: Number(mod.extraPrice ?? 0),
      }));

      if (modifiers.some((mod) => !Number.isFinite(mod.extraPrice))) {
        return {
          success: false,
          error: `Invalid modifier price for menu item ${cartItem.menuItemId}`,
          statusCode: 400,
        };
      }

      const modifierTotal = modifiers.reduce(
        (sum: number, mod) => sum + mod.extraPrice,
        0
      );

      const unitPrice = basePrice + modifierTotal;
      const itemTotal = unitPrice * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: dbItem.id,
        menuItemName: dbItem.name!,         // snapshot from DB
        quantity: cartItem.quantity,
        unitPrice,                           // snapshot from DB — not from cart
        // specialInstruction: cartItem.specialInstruction ?? null,
        modifiers,
      });
    }

    // ── 7. Calculate charges ────────────────────────────────────
    const TAX_RATE = 0.05;
    const DELIVERY_FEE = 40;
    const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const deliveryFee = DELIVERY_FEE;
    let discountAmount = 0;
    let couponId: string | null = null;

    // ── 8. Validate and apply coupon ────────────────────────────
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

      if (
        coupon.minOrderAmount &&
        subtotal < Number(coupon.minOrderAmount)
      ) {
        return {
          success: false,
          error: `Minimum order amount for this coupon is Rs.${coupon.minOrderAmount}`,
          statusCode: 400,
        };
      }

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

    if (
      !Number.isFinite(subtotal) ||
      !Number.isFinite(taxAmount) ||
      !Number.isFinite(deliveryFee) ||
      !Number.isFinite(discountAmount) ||
      !Number.isFinite(totalAmount)
    ) {
      return {
        success: false,
        error: "Invalid order amount calculation",
        statusCode: 400,
      };
    }

    // ── 9. Generate order number ────────────────────────────────
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    // ── 10. Prisma transaction ──────────────────────────────────
    let order;

    try {
      order = await this.prisma.$transaction(async (tx) => {

      // 10a. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customer: { connect: { id: userIdStr } },
          branch: { connect: { id: branchId } },
          address: { connect: { id: addressId } },
          ...(couponId ? { coupon: { connect: { id: couponId } } } : {}),
          subtotal,
          taxAmount,
          deliveryFee,
          discountAmount,
          totalAmount,
          status: "PLACED",
          paymentStatus: "PENDING",
          placedAt: new Date(),
          scheduledAt: scheduledDate,
        },
      });
      // 10b. Create OrderItems
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

        // 10c. Create modifiers for this item (empty array for now — no modifiers in cart yet)
        if (item.modifiers.length > 0) {
          await tx.orderItemModifier.createMany({
            data: item.modifiers.map((mod: any) => ({
              orderItemId: orderItem.id,
              modifierName: mod.modifierName,
              extraPrice: mod.extraPrice,
            })),
          });
        }
      }

      // 10d. Status history — initial entry
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          oldStatus: null,
          newStatus: "PLACED",
          changedBy: userIdStr,
          changedAt: new Date(),
        },
      });

      // 10e. Coupon usage
      if (couponId) {
        await tx.couponUsage.create({
          data: {
            couponId,
            customerId: userIdStr,
            orderId: newOrder.id,
            usedAt: new Date(),
          },
        });
      }

      // 10f. Payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          paymentMethod: normalizedPaymentMethod,
          amount: totalAmount,
          status: "PENDING",
        },
      });

      // 10g. Delivery record
      await tx.delivery.create({
        data: {
          orderId: newOrder.id,
          status: "PENDING",
        },
      });

      return newOrder;
    });
    } catch (error) {
      console.error("createOrder transaction error:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create order",
        statusCode: 500,
      };
    }

    // ── 11. Clear cart from Redis after successful transaction ──
    try {
      await this.cartService.clearCart(userId);
    } catch (error) {
      console.error("createOrder clearCart error:", error);
    }

    // ── 12. Return response ─────────────────────────────────────
    return {
      success: true,
      message: "Order placed successfully",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        branchId,  // needed by controller to trigger assignment
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

  }

  async listOrders(userId: string): Promise<ServiceResponse<any>> {
    const orders = await this.orderRepo.listOrdersByUserId(userId);
    console.log("Orders fetched for user", userId, orders);
    return {
      success: true,
      data: orders,
      message: "Orders fetched successfully",
      statusCode: 200,
    }
  }

  async getOrderById(orderId: string): Promise<ServiceResponse<any>> {
    //fetch order details from DB
    //validate order belongs to user
    //return order details along with items, modifiers, status history etc.
    const order = await this.orderRepo.getOrderById(orderId);

    if (!order) {
      return {
        success: false,
        error: "Order not found",
        statusCode: 404,
      };
    }

    // if (order.customerId !== userId) {
    //   return {
    //     success: false,
    //     error: "Unauthorized access to this order",
    //     statusCode: 403,
    //   };
    // }

    return {
      success: true,
      data: order, // replace with actual order details
      message: "Order details fetched successfully",
      statusCode: 200,
    }
  }

  async getStatusHistory(orderId: string, userId: string): Promise<ServiceResponse<any>> {
    //fetch order details from DB
    //validate order belongs to user
    //return order details along with items, modifiers, status history etc.
    const order = await this.orderRepo.getOrderById(orderId);

    if (!order) {
      return {
        success: false,
        error: "Order not found",
        statusCode: 404,
      };
    }

    if (order.customerId !== userId) {
      return {
        success: false,
        error: "Unauthorized access to this order",
        statusCode: 403,
      };
    }

    const statusHistory = await this.orderRepo.getStatusHistory(orderId);

    console.log(statusHistory, "Status history fetched for order", orderId);

    return {
      success: true,
      data: statusHistory,
      message: "Status history fetched successfully",
      statusCode: 200,
    };
  }

  async updateOrderStatus(orderId: string, newStatus: string): Promise<ServiceResponse<any>> {
    {
      //fetch order details from DB
      //validate order belongs to user
      //validate newStatus is a valid status done by admin or restaurant staff
      //update order status in DB
      //insert a new record in order status history table
      //return updated order details  




      return {
        success: true,
        data: {},
        message: "Orders fetched successfully",
        statusCode: 200,
      }


    }
  }

  // ROUTE 1 — Restaurant Staff Status Update
  // PATCH /api/orders/:orderId/status
  // ─────────────────────────────────────────────

  //currently the queries are in service layer later after merging i will add this queries inside restrau staff respository and will call them using restrau service!!
  async updateOrderStatusByStaff(
    orderId: string,
    staffUserId: string,
  ): Promise<ServiceResponse<any>> {

    // 1. Fetch the order
    const order = await this.prisma.order.findFirst({
      where: { id: orderId },
      include: { branch: true, delivery: true },
    });
    let staffUserIdDummy = staffUserId;
    if (!order) {
      return { success: false, error: "Order not found", statusCode: 404 };
    }

    console.log(staffUserIdDummy,"staff user id for updating order status by staff")

    // 2. Verify staff belongs to this branch
    const staffRecord = await this.prisma.restaurantStaff.findFirst({
      where: {
        userId: staffUserIdDummy, //currently dummy
        branchId: order.branchId,
        isActive: true,
        isDeleted: false,
      },
    });

    if (!staffRecord) {
      return {
        success: false,
        error: "You are not assigned to this branch",
        statusCode: 403,
      };
    }

    // 3. Check transition is valid for staff
    console.log(order, "order")
    const nextStatus = STAFF_TRANSITIONS[order.status];
    console.log(nextStatus,"next status for order")
    if (!nextStatus) {
      return {
        success: false,
        error: `Staff cannot transition order from ${order.status}`,
        statusCode: 400,
      };
    }

    if (nextStatus === "PREPARING") {

      console.log(`Order ${orderId} is now READY_FOR_PICKUP. Assigning nearest delivery partner...`);


    await this.orderAssignmentService
    .assignNearestPartner(orderId)
    .catch((err) => console.error(`Assignment failed for order ${orderId}:`, err));
}

    const oldStatus = order.status;
    const isReadyForPickup = nextStatus === "READY_FOR_PICKUP";

    // 4. Run transaction
    const updatedOrder = await this.prisma.$transaction(async (tx) => {

      // 4a. Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: nextStatus },
      });

      // 4b. Log status history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          oldStatus,
          newStatus: nextStatus,
          changedBy: staffUserId,
          changedAt: new Date(),
        },
      });

      // 4c. If READY_FOR_PICKUP — update delivery + notify active partners
      if (isReadyForPickup) {

        await tx.delivery.update({
          where: { orderId },
          data: { status: "ASSIGNED" },
        });

        const activePartners = await tx.deliveryPartner.findMany({
          where: {
            status: "ACTIVE",
            isDeleted: false,
          },
          select: { userId: true },
        });

        if (activePartners.length > 0) {
          await tx.notification.createMany({
            data: activePartners.map((partner) => ({
              userId: partner.userId,
              title: "New Delivery Available",
              message: `Order ${order.orderNumber} is ready for pickup at ${order.branch?.branchName}`,
              notificationType: "ORDER_UPDATE",
              status: "PENDING",
            })),
          });
        }
      }

      return updated;
    });

    return {
      success: true,
      message: `Order status updated to ${nextStatus}`,
      data: {
        orderId,
        orderNumber: order.orderNumber,
        oldStatus,
        newStatus: nextStatus,
      },
      statusCode: 200,
    };
  }


  async getOrdersReadyForPickup(): Promise<ServiceResponse<any>> {
    try {

      const orders = await this.orderRepo.getOrdersReadyForPickup();

      return {
        success: true,
        message: "Orders ready for pickup fetched",
        data: { orders, count: orders.length },
        statusCode: 200,
      };

    } catch (error: any) {
      console.error("getOrdersReadyForPickup error:", error);
      return { success: false, error: "Failed to fetch orders", statusCode: 500 };
    }
  }

  //currently the repo doesnt consisit of the delivery routes 
  async updateOrderStatusByDeliveryPartner(
    orderId: string,
    deliveryUserId: string,
  ): Promise<ServiceResponse<any>> {
    try {

      // 1. Get delivery partner profile
      const partnerRecord = await this.prisma.deliveryPartner.findFirst({
        where: { userId: deliveryUserId, isDeleted: false },
      });

      if (!partnerRecord) {
        return { success: false, error: "Delivery partner profile not found", statusCode: 404 };
      }

      // 2. Fetch order with delivery
      const order = await this.prisma.order.findFirst({
        where: { id: orderId },
        include: { delivery: true },
      });

      console.log("Order fetched for delivery update:", order);

      if (!order || !order.delivery) {
        return { success: false, error: "Order or delivery record not found", statusCode: 404 };
      }

      const delivery = order.delivery;
      const oldStatus = order.status;

      // 3. Check transition is valid for delivery partner
      const nextStatus = DELIVERY_TRANSITIONS[order.status];
      if (!nextStatus) {
        return {
          success: false,
          error: `Delivery partner cannot transition order from ${order.status}`,
          statusCode: 400,
        };
      }

      // 4. If partner is claiming this order (READY_FOR_PICKUP → PICKED_UP)
      //    verify no other partner has already claimed it
      const isClaimingOrder = order.status === "READY_FOR_PICKUP";

      if (isClaimingOrder && delivery.currentPartnerId !== null) {
        return {
          success: false,
          error: "This order has already been claimed by another delivery partner",
          statusCode: 409,
        };
      }

      // 5. If already claimed, verify THIS partner owns it
      if (!isClaimingOrder && delivery.currentPartnerId !== partnerRecord.id) {
        return {
          success: false,
          error: "You are not assigned to this delivery",
          statusCode: 403,
        };
      }

      const isDelivered = nextStatus === "DELIVERED";

      if (isDelivered) {
        // Process payout immediately
        const payout = await this.payoutService.processPayout(orderId);
        console.log(payout)
      }


      // 6. Run transaction
      const updatedOrder = await this.prisma.$transaction(async (tx) => {

        // 6a. Update order status
        const updated = await tx.order.update({
          where: { id: orderId },
          data: {
            status: nextStatus,
            ...(isDelivered && { deliveredAt: new Date() }),
          },
        });

        // 6b. Update delivery record
        await tx.delivery.update({
          where: { orderId },
          data: {
            status: nextStatus === "PICKED_UP"
              ? "PICKED_UP"
              : nextStatus === "DELIVERED"
                ? "DELIVERED"
                : delivery.status,
            currentPartnerId: partnerRecord.id,// claim or confirm partner
            ...(isClaimingOrder && { acceptedAt: new Date() }),
            ...(nextStatus === "PICKED_UP" && { pickedUpAt: new Date() }),
            ...(isDelivered && { deliveredAt: new Date() }),
          },
        });

        // 6c. Log status history
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            oldStatus,
            newStatus: nextStatus,
            changedBy: deliveryUserId,
            changedAt: new Date(),
          },
        });

        // 6d. If claiming order — create delivery assignment record
        if (isClaimingOrder) {
          await tx.deliveryAssignment.create({
            data: {
              deliveryId: delivery.id,
              partnerId: partnerRecord.id,
              assignedAt: new Date(),
              respondedAt: new Date(),
              responseStatus: "ACCEPTED",
            },
          });

          // Set partner as ON_DELIVERY
          await tx.deliveryPartner.update({
            where: { id: partnerRecord.id },
            data: { status: "ON_DELIVERY" },
          });
        }

        // 6e. If delivered — notify customer + free up partner
        if (isDelivered) {
          await tx.notification.create({
            data: {
              userId: order.customerId,
              title: "Order Delivered!",
              message: `Your order ${order.orderNumber} has been delivered. Enjoy your meal!`,
              notificationType: "ORDER_UPDATE",
              status: "PENDING",
            },
          });

          // Free the delivery partner
          await tx.deliveryPartner.update({
            where: { id: partnerRecord.id },
            data: { status: "ACTIVE" },
          });
        }

        return updated;
      });

      return {
        success: true,
        message: `Order status updated to ${nextStatus}`,
        data: {
          orderId,
          orderNumber: order.orderNumber,
          oldStatus,
          newStatus: nextStatus,
        },
        statusCode: 200,
      };

    } catch (error: any) {
      console.error("updateOrderStatusByDeliveryPartner error:", error);
      return { success: false, error: "Failed to update delivery status", statusCode: 500 };
    }
  }

//find active orders for a branch polling
async getBranchOrdersForStaff(
  staffUserId: string
): Promise<ServiceResponse<any>> {
  let staffUserIdDummy = staffUserId
console.log("Fetching branch orders for staff user:", staffUserIdDummy);
  // 1. Find staff's branch
  const staffRecord = await this.prisma.restaurantStaff.findFirst({
    where: { userId: staffUserIdDummy, isActive: true, isDeleted: false },
  })
  //dummy
  console.log(staffRecord,"staff record for fetching branch orders")

  if (!staffRecord) {
    return {
      success: false,
      error: "You are not assigned to any branch",
      statusCode: 403,
    };
  }

  // 2. Fetch active orders for this branch
  // Active = not yet fully handed off to delivery partner pickup flow, and not cancelled/delivered
  const orders = await this.prisma.order.findMany({
    where: {
      branchId: staffRecord.branchId,
      status: {
        in: ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP"],
      },
    },
    orderBy: { placedAt: "asc" }, // oldest first — fairness, matches kitchen queue logic
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      placedAt: true,
      scheduledAt: true,
      customer: {
        select: { fullName: true, mobile: true },
      },
      orderItems: {
        select: {
          menuItemName: true,
          quantity: true,
          specialInstruction: true,
          modifiers: {
            select: { modifierName: true },
          },
        },
      },
    },
  });

  return {
    success: true,
    message: "Branch orders fetched successfully",
    data: { orders, branchId: staffRecord.branchId },
    statusCode: 200,
  };
}

}
