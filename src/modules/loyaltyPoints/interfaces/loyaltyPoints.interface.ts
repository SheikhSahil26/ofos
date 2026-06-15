import { LoyaltyTransactionType } from "@prisma/client";

export interface ILoyaltyTransaction{
    accountId: string,
    points: number,
    transactionType: LoyaltyTransactionType,
    referenceOrderId?: string
}

export interface IBalance{
    customerId: string,
    points: number,
}