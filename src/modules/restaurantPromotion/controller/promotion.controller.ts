import { Request, Response } from "express";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { RestaurantPromotionService } from "../service/promotion.service";
import { ICreatePromotion } from "../interface/promotion.interface";
import { AppError } from "../../../utils/appError";

export class RestaurantPromotionController {
  private promotionService: RestaurantPromotionService =
    new RestaurantPromotionService();

  // create promotion
  createPromotion = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId as string;

    const user = req.user as Express.payload | undefined;
    if (!user || typeof user.userId !== "string") {
      throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;
    const payload = req.body as ICreatePromotion;

    const data = await this.promotionService.createPromotion(
      restaurantId,
      userId,
      payload,
    );

    return res.status(data.statusCode!).json({
      ...data,
    });
  });

  deletePromotion = asyncHandler(async (req: Request, res: Response) => {
    const promotionId = req.params.id as string;

    const user = req.user as Express.payload | undefined;
    if (!user || typeof user.userId !== "string") {
      throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

    const data = await this.promotionService.deletePromotion(
      promotionId,
      userId,
    );

    return res.status(data.statusCode!).json({
      ...data,
    });
  });

  togglePromotionStatus = asyncHandler(async (req: Request, res: Response) => {
    const promotionId = req.params.id as string;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      throw new AppError("isActive boolean is required", 400);
    }

    const user = req.user as Express.payload | undefined;
    if (!user || typeof user.userId !== "string") {
      throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

    const data = await this.promotionService.togglePromotionStatus(
      promotionId,
      userId,
      isActive
    );

    return res.status(data.statusCode!).json({
      ...data,
    });
  });

  getRestaurantPromotions =
asyncHandler(
    async(
        req:Request,
        res:Response
    ) => {

        const restaurantId =
        req.params.restaurantId as string;

        const data =
        await this.promotionService
        .getRestaurantPromotions(
            restaurantId
        );

        return res.status(
            data.statusCode!
        ).json({
            ...data
        });

    }
);
}
