import { PrismaClient, PayoutStatus } from "@prisma/client";

export class PayoutRepository {
    constructor(private prisma: PrismaClient) { }

    async getOrderById(orderId: string) {
        return this.prisma.order.findUnique({
            where: {
                id: orderId
            },
            include: {
                branch: true,
                delivery: true
            }
        });
    }

    async getPayoutByOrderId(orderId: string) {
        return this.prisma.payoutTransaction.findUnique({
            where: { orderId },
        });
    }

    async createPayoutTransaction(
        orderId: string,
        grossAmount: number,
        restaurantAmount: number,
        deliveryAmount: number,
        platformFee: number
    ) {
        return this.prisma.payoutTransaction.create({
            data: {
                orderId,
                grossAmount,
                restaurantAmount,
                deliveryAmount,
                platformFee,
                status: PayoutStatus.COMPLETED,
                processedAt: new Date(),
            },
        });
    }


}