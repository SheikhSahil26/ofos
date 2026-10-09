import {
    SettlementStatus,
    SettlementType
} from "@prisma/client";

export interface IDashboardStatsResponse {

    pendingSettlements: number;

    restaurantPendingAmount: number;

    deliveryPendingAmount: number;

    todaySettlements: number;

    totalPaidAmount: number;

}


export interface IPendingSummaryResponse {
    totalPendingAmount: number;
    totalPendingPayouts: number;
    lastSettlementDate: Date | null;
}

export interface IPayoutHistoryItem {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
}

export interface IPayoutHistoryResponse {
    payouts: IPayoutHistoryItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}
export interface ISettlementResponse {
    id: string;
    settlementType: SettlementType;
    beneficiaryId: string;
    totalAmount: number;
    payoutCount: number;
    status: SettlementStatus;
    createdAt: Date;
    settledAt: Date | null;
}

export interface ISettlementListResponse {
    settlements?: ISettlementResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}