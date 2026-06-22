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
    pagination: IPagination;
}

export interface ILoyaltySummary {
    currentPoints: number;
    totalEarned: number;
    totalRedeemed: number;
    totalTransactions: number
}

export interface ILoyaltyTransactions {
    id: string;
    points: number;
    type: LoyaltyTransactionType;
    createdAt: Date;
}

export interface IPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface IPaginatedLoyaltyTransactions {
    transactions: ILoyaltyTransactions[];
    pagination: IPagination;
}

export enum LoyaltyPeriod {
    DAY = "DAY",
    WEEK = "WEEK",
    MONTH = "MONTH",
    ALL = "ALL"
}

export interface IGetLoyaltyDashboardQuery {
    page: number;
    limit: number;
    type?: LoyaltyTransactionType;
    period?: LoyaltyPeriod;
}