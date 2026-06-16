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
}