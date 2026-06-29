import { Request, Response } from "express";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { ReviewService } from "../services/review.service";
import { AppError } from "../../../utils/appError";

export class ReviewController {
    private reviewService = new ReviewService();

    createReview = asyncHandler(async (req: Request, res: Response) => {

        const user = req.user as Express.payload;

        const response = await this.reviewService.createReview(
            user.userId,
            req.body
        );

        res.status(response.statusCode || 201).json(response);
    });

    //get all reviews of a branch
    getReviews = asyncHandler(async (req: Request, res: Response) => {

        const user = req.user as Express.payload;

        const ownerId = user.userId;

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 10;

        const response = await this.reviewService.getReviews(
            ownerId,
            page,
            limit
        );

        res.status(response.statusCode!).json(response);
    });
}