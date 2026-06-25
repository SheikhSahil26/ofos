import { PrismaClient, PaymentTransactionStatus, OrderPaymentStatus } from "@prisma/client";

export class PaymentRepository {
    constructor(private prisma: PrismaClient) { }

    // Get payment info by orderId
    async getPaymentByOrderId(orderId: string) {
        return this.prisma.payment.findFirst({
            where: { orderId },
        });
    }

    // Get paymnet information about the paymentId Which assign at The place order
    async getPaymentById(paymentId: string) {
        return this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                order: true,
            },
        });
    }

    // Now actual flow of payments comes. Payment moves from user to the bank
    async processPaymentSuccess(
        paymentId: string,
        orderId: string,
        amount: number
    ) {
        return this.prisma.$transaction(async (tx) => {

            const payment = await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: PaymentTransactionStatus.SUCCESS,
                    paidAt: new Date(),
                },
            });

            await tx.order.update({
                where: { id: orderId },
                data: {
                    paymentStatus: OrderPaymentStatus.PAID,
                },
            });

            await tx.paymentTransaction.create({
                data: {
                    paymentId,
                    transactionId: crypto.randomUUID(),
                    amount,
                    status: PaymentTransactionStatus.SUCCESS,
                    responseMessage: "Payment completed successfully",
                },
            });

            return payment;
        });
    }

    async processPaymentFailure(
        paymentId: string,
        orderId: string,
        amount: number,
        reason: string
    ) {
        return this.prisma.$transaction(async (tx) => {

            const payment = await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: PaymentTransactionStatus.FAILED,
                },
            });

            await tx.order.update({
                where: { id: orderId },
                data: {
                    paymentStatus: OrderPaymentStatus.FAILED,
                },
            });

            await tx.paymentTransaction.create({
                data: {
                    paymentId,
                    transactionId: crypto.randomUUID(),
                    amount,
                    status: PaymentTransactionStatus.FAILED,
                    responseMessage: reason,
                },
            });

            return payment;
        });
    }
}