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

        console.log("Order fetched from repository:", order);

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
         const orders = await prisma.order.findMany({
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

    //count total orders per user by userId
    async getOrderCountById(userId: string): Promise<number>{
        return await prisma.order.count({
            where: {
                customerId: userId,
            }
        });
    }

    //get restaurants from recent orders
    async getRecentRestaurants(userId: string){

        return await prisma.order.findMany({
            where: {
                customerId: userId,
            },

            orderBy: {
                placedAt: "desc",
            },

            take: 5,

            distinct: ["branchId"],

            include: {
                branch: {
                    select: {
                        id: true,
                        branchName: true,

                        restaurant: {
                            select: {
                                id: true,
                                name: true,
                                logoUrl: true,
                            }
                        }
                    }
                },
            }
        })
    }

    //get recent order
    async getRecentOrder(userId: string){
        return prisma.order.findFirst({
            where: {
                customerId: userId,

                status: {
                    in: [
                        "PLACED",
                        "CONFIRMED",
                        "PREPARING",
                        "READY_FOR_PICKUP",
                        "OUT_FOR_DELIVERY",
                    ]
                }
            },

            orderBy: {
                placedAt: "desc",
            }
        })
    }

    async getTrackingDetails(orderId: string) {
        return prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                orderNumber: true,
                status: true,
                customerId: true,
                placedAt: true,
                deliveredAt: true,
                branch: {
                    select: {
                        branchName: true,
                        latitude: true,
                        longitude: true,
                    },
                },
                address: {
                    select: {
                        addressLine1: true,
                        addressLine2: true,
                        city: true,
                        state: true,
                        pincode: true,
                        latitude: true,
                        longitude: true,
                    },
                },
                delivery: {
                    select: {
                        id: true,
                        status: true,
                        currentPartnerId: true,
                        currentPartner: {
                            select: {
                                id: true,
                                userId: true,
                                vehicleType: true,
                                vehicleNumber: true,
                                user: {
                                    select: {
                                        fullName: true,
                                        mobile: true,
                                        profilePhoto: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    //get order details in detail
    async getOrderDetailsById(orderId: string) {
        return prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        fullName: true,
                        mobile: true,
                        profilePhoto: true,
                    },
                },
                branch: {
                    select: {
                        id: true,
                        branchName: true,
                    },
                },
                address: {
                    select: {
                        addressLine1: true,
                        addressLine2: true,
                        city: true,
                        state: true,
                        pincode: true,
                    },
                },
               orderItems: {
                    select: {
                        id: true,
                        menuItemName: true,
                        quantity: true,
                        price: true,
                        specialInstruction: true,
                        modifiers: {
                            select: {
                                modifierName: true,
                                extraPrice: true,
                            },
                        },
                    },
                },
                delivery: {
                    include: {
                        currentPartner: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                        mobile: true,
                                        profilePhoto: true
                                    }
                                }
                            }
                        }
                    }
                },
                review: {
                    include: {
                        images: true,
                    },
                },
            },
        });
    }
}
