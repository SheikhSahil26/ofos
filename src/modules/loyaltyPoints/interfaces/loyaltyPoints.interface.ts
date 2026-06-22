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

export interface ILoyaltyOverviewResponse {
    summary: ILoyaltySummary;
    transactions: ILoyaltyTransactions[];
}

export interface ILoyaltySummary {
    currentPoints: number;
    totalEarned: number;
    totalRedeemed: number;
    earnedThisMonth: number
}

export interface ILoyaltyTransactions {
    id: string;
    customerId: string;
    points: number;
    type: LoyaltyTransactionType;
    createdAt: Date;
}