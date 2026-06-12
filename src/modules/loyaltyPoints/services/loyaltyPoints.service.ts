import { LoyaltyAccount, LoyaltyTransaction, LoyaltyTransactionType } from "@prisma/client";
import { ServiceResponse } from "../../../common/types/service-response.type";
import { LoyaltyPointsRepository } from "../repositories/loyaltyPoints.repository";
import { IBalance, ILoyaltyTransaction } from "../interfaces/loyaltyPoints.interface";
import { OrdersRepository } from "../../orders/repositories/orders.repository";
import { AppError } from "../../../utils/appError";

export class LoyaltyPointsService{
    
    private loyaltyPointRepo = new LoyaltyPointsRepository();
    private orderRepo = new OrdersRepository();

    //get balance (current points)
    async getBalanceByCustomerId(customerId: string): Promise<ServiceResponse<IBalance>>{
        
        const account = await this.loyaltyPointRepo.getBalanceByCustomerId(customerId);
        let balance : IBalance;

        if(!account){
            balance = {
                customerId: customerId,
                points: 0,
            }
        }
        else{
            balance = {
                customerId: account.customerId,
                points: account.currentPoints,
            }
        }

        return {
            success: true,
            data: balance,
            message: "Loyalty points fetched successfully",
            statusCode: 200
        }
    }

    //get transaction history 
    async getLoyaltyTransactions(customerId: string): Promise<ServiceResponse<LoyaltyTransaction[]>>{

        const transactions = await this.loyaltyPointRepo.getLoyaltyTransactions(customerId);

        return {
            success: true,
            data: transactions,
            message: "Transaction history fetched successfully",
            statusCode: 200
        }
    }  
    
    //award points (earn points)
    async awardPoints(orderId: string): Promise<ServiceResponse<null>>{
        
        //check if order exist or not
        const order = await this.orderRepo.getOrderById(orderId);

        if(!order){
            throw new AppError("Order not found", 404);
        }

        //check if points already earned for that order not
        const existingTransaction = await this.loyaltyPointRepo.findEarnedTransactionByOrderId(orderId);

        if(existingTransaction){
            return {
                success: false,
                message: "Already earned the points for this order",
                statusCode: 409
            };
        }

        //check if account already exist or not
        let account = await this.loyaltyPointRepo.getBalanceByCustomerId(order.customerId);

        //if account doesn't exist then create new account
        if(!account){
            account = await this.loyaltyPointRepo.createAccount(order.customerId);
        }

        //calculating points by order amount
        const points = Math.floor(Number(order.totalAmount) / 10);

        //add earned points to current points 
        await this.loyaltyPointRepo.updatePoints(account.id, account.currentPoints + points);

        const data: ILoyaltyTransaction = {
            accountId: account.id,
            points: points,
            transactionType: LoyaltyTransactionType.EARN,
            referenceOrderId: order.id
        }

        //create transaction for this earned points
        await this.loyaltyPointRepo.createTransaction(data);

        return {
            success: true,
            message: "Loyalty points awarded",
            statusCode: 201
        }
    }

    async redeemPoints(customerId: string, orderId: string, points: number): Promise<ServiceResponse<void>>{
        
        //check if account exist or not
        const account = await this.loyaltyPointRepo.getBalanceByCustomerId(customerId);

        if(!account){
            return {
                success: false,
                message: "Place your first order and get your first loyalty points",
                statusCode: 404
            }
        }

        //checking if current points are sufficient or not
        if(account.currentPoints < points){
            return {
                success: false,
                message: "Insufficient loyalty points",
                statusCode: 400
            }
        }

        //updating points (redeem points)
        const updatedPoints = await this.loyaltyPointRepo.updatePoints(account.id, account.currentPoints - points);

        const data: ILoyaltyTransaction = {
            accountId: account.id,
            points: points,
            transactionType: LoyaltyTransactionType.REDEEM,
            referenceOrderId: orderId
        }

        //create transaction 
        await this.loyaltyPointRepo.createTransaction(data);

        return {
            success: true,
            message: "Points redeemed",
            statusCode: 201
        }
    }

    //calculate discount amount
    async calculateDiscount(cutomerId: string, points: number): Promise<ServiceResponse<number>>{
        
        const account = await this.loyaltyPointRepo.getBalanceByCustomerId(cutomerId);

        if(!account){
            throw new AppError("Account doesn't exist", 404);
        }

        if(account.currentPoints < points){
            return {
                success: false,
                message: "Insufficient loytalty balance",
                statusCode: 400
            }
        }

        const discount = points * 0.10;

        return {
            success: true,
            data: discount,
            message: "Discount calculated",
            statusCode: 200
        }
    }
}