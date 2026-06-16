// import {  } from "../interfaces/orders.interface";
import { prisma } from "../../../config/prisma";

export class OrdersRepository {
    prisma: any;
  // get restaurant details by id
    async createOrder(
        userId: string
    ){
        //order creation logic will be here
        
       
    }

    async listOrdersByUserId(userId: string){
        const orders = await prisma.order.findMany({
            where: {
                customerId: userId,
            },
            include: {
                orderItems: {
                    include: {
                        menuItem: true,
                    },
                },
                address: true,
            },
        });

        return orders;
    }

    async getOrderById(orderId: string){
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                orderItems: {
                    include: {
                        menuItem: true,
                    },
                },
                address: true,
            },
        });

        return order;
    }

    async getStatusHistory(orderId: string){
        const statusHistory = await prisma.orderStatusHistory.findMany({
            where: {
                orderId: orderId,
            },
            orderBy: {
                changedAt: "asc",
            },
        });

        return statusHistory;
    }

    async updateOrderStatus(orderId: string, newStatus: string){
        // Update the order's current status
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus as any },
        });

        // Log the status change in the history table
        await prisma.orderStatusHistory.create({
            data: {
                orderId: orderId,
                newStatus : newStatus as any,
                changedAt: new Date(),
            },
        });

        return updatedOrder;
    }

    async getOrdersReadyForPickup(){
         const orders = await this.prisma.order.findMany({
      where: {
        status: "READY_FOR_PICKUP",
        delivery: {
          status: "ASSIGNED",
          currentPartnerId: null, // not yet claimed by any partner
        },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        placedAt: true,
        totalAmount: true,
        branch: {
          select: {
            branchName: true,
            addressLine1: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
        address: {
          select: {
            addressLine1: true,
            city: true,
            pincode: true,
            latitude: true,
            longitude: true,
          },
        },
        orderItems: {
          select: {
            menuItemName: true,
            quantity: true,
          },
        },
      },
      orderBy: { placedAt: "asc" }, // oldest first — fairness
    });

        return orders;
    }

  
}
