import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";
import { LoyaltyPointsService } from "../services/loyaltyPoints.service";
import { Request, Response } from "express";

export class LoyaltyPointsController{

    private loyaltyPointService = new LoyaltyPointsService();

    //get balance of loyalty account
    getBalance = asyncHandler( async(req: Request, res: Response) => {

        const user = req.user as Express.payload | undefined;
        
        if(!user || typeof user.userId !== "string"){
            throw new AppError("Invalid user id", 409);
        }

        const customerId = user.userId;

        const response = await this.loyaltyPointService.getBalanceByCustomerId(customerId);

        res.status(response.statusCode || 200).json(response);
    });

    //get transaction history
    getTransactions = asyncHandler( async(req: Request, res: Response) => {

        const user = req.user as Express.payload | undefined;

        if(!user || typeof user.userId !== "string"){
            throw new AppError("Invalid user id", 409);
        }

        const customerId = user.userId;

        const response = await this.loyaltyPointService.getLoyaltyTransactions(customerId);

        res.status(response.statusCode || 200).json(response);
    });

    //estimated discount for an order
    getDiscount = asyncHandler( async(req: Request, res: Response) => {

        const user = req.user as Express.payload | undefined;

        if(!user || typeof user.userId !== "string"){
            throw new AppError("Invalid user id", 404);
        }

        const customerId = user.userId;

        const points = Number(req.query.points);
        
        const response = await this.loyaltyPointService.calculateDiscount(customerId, points);

        res.status(response.statusCode || 200).json(response);
    });

    //earn estimate (how many points user will get when he place an order)
    earnEstimate = asyncHandler( async(req: Request, res: Response) => {

        const amount = Number(req.query.amount);

        const response = await this.loyaltyPointService.earnEstimate(amount);

        res.status(response.statusCode || 200).json(response);
    });
}