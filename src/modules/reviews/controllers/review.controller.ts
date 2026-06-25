import { Request, Response } from "express";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { ReviewService } from "../services/review.service";

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
}