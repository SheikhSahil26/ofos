import { LoyaltyTransactionType } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { ILoyaltyTransaction } from "../interfaces/loyaltyPoints.interface";

export class LoyaltyPointsRepository{

    //check if account exist for customer or not
    async getBalanceByCustomerId(customerId: string){
        return await prisma.loyaltyAccount.findUnique({
            where: {
                customerId,
            }
        });
    }

    //create account for customer
    async createAccount(customerId: string){
        return prisma.loyaltyAccount.create({
            data: {
                customerId
            }
        })
    }

    //update points
    async updatePoints(accountId: string, currentPoints: number){
        return prisma.loyaltyAccount.update({
            where: {
                id: accountId,
            },
            data: {
                currentPoints,
            }
        })
    }

    //create transaction
    async createTransaction(data: ILoyaltyTransaction){
        return prisma.loyaltyTransaction.create({
            data: data
        })
    }

    //get transaction history
    async getLoyaltyTransactions(customerId: string){
        return prisma.loyaltyTransaction.findMany({
            where: {
                account: {
                    customerId
                }
            },
            orderBy: {
                createdAt: "desc",
            }
        });
    }

    //find earned transaction by order id
    async findEarnedTransactionByOrderId(orderId: string){
        return prisma.loyaltyTransaction.findFirst({
            where: {
                referenceOrderId: orderId,
                transactionType: LoyaltyTransactionType.EARN,
            }
        });
    }

    //get earned points
    async getEarnedPoints(userId: string){
        const result =
            await prisma.loyaltyTransaction.aggregate({
                where: {
                    account: {
                        customerId: userId
                    },
                    points: {
                        gt: 0
                    }
                },
                _sum: {
                    points: true
                }
            });

        return result._sum.points || 0;
    }

    //get redeemed points
    async getRedeemedPoints(userId: string){
        const result = await prisma.loyaltyTransaction.aggregate({
            where: {
                account: {
                    customerId: userId
                },
                points: {
                    lt: 0
                }
            },
            _sum: {
                points: true
            }
        });

        return Math.abs(
            result._sum.points || 0
        );
    }

    //get transaction count
    async getTransactionCount(userId: string) {

        const count = await prisma.loyaltyTransaction.count({
            where: {
                account: {
                    customerId: userId
                }
            }
        });

        return count;
    }

    //get all transactions with pagination and filter
    async getTransactions(
        userId: string,
        page: number,
        limit: number,
        typeFilter?: "earned" | "redeemed",
        dateFilter?: "day" | "week" | "month",
    ) {

        const skip =
        (page - 1) * limit;

        const where: any = {
            account: {
                customerId: userId
            }
        };

        // Date filter
        if (dateFilter) {

            const now =
                new Date();

            let startDate =
                new Date();

            if (dateFilter === "day") {

                startDate.setHours(
                    0, 0, 0, 0
                );

            } else if (
                dateFilter === "week"
            ) {

                startDate.setDate(
                    now.getDate() - 7
                );

            } else if (
                dateFilter === "month"
            ) {

                startDate.setMonth(
                    now.getMonth() - 1
                );
            }

            where.createdAt = {
                gte: startDate
            };
        }

        // Transaction type filter
        if (typeFilter === "earned") {

            where.points = {
                gt: 0
            };
        }

        if (typeFilter === "redeemed") {

            where.points = {
                lt: 0
            };
        }

        const [
            transactions,
            total
        ] = await Promise.all([

            prisma.loyaltyTransaction.findMany({
                where,
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit
            }),

            prisma.loyaltyTransaction.count({
                where
            })
        ]);

        return {
            transactions,
            total
        };
    }
}