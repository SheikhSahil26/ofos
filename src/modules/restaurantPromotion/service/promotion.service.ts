import { PromotionType } from "@prisma/client";
import { RestaurantPromotionRepository } from "../repository/promotion.repo";
import {
  ICreatedPromotion,
  ICreatePromotion,
  IDeletePromotionResponse,
  IPromotionValidation,
  IRestaurantPromotionsResponse,
} from "../interface/promotion.interface";
import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { prisma } from "../../../config/prisma";
import { RestaurantService } from "../../restaurant/services/restaurant.service";
import { RestaurantRepository } from "../../restaurant/repositories/restaurant.repository";

export class RestaurantPromotionService {
  private promotionRepo: RestaurantPromotionRepository =
    new RestaurantPromotionRepository();
  private readonly restaurantService = new RestaurantService();
  private readonly restaurantRepo = new RestaurantRepository();

  // create Restaurant Promotion
  async createPromotion(
    restaurantId: string,
    userId: string,
    payload: ICreatePromotion,
  ): Promise<ServiceResponse<ICreatedPromotion>> {
    await this.restaurantService.validateRestaurantOwnership(
      restaurantId,
      userId,
    );

    const startDate = new Date(payload.startDate);

    const endDate = new Date(payload.endDate);
    const now = new Date();

    if (endDate < now) {
      throw new AppError("End date cannot be in the past", 400);
    }

    if (startDate > endDate) {
      throw new AppError("Start date cannot be greater than end date", 400);
    }

    const code = payload.code?.trim().toUpperCase();

    if (code) {
      const existingPromotion =
        await this.promotionRepo.validateActivePromotionCode(
          restaurantId,
          code,
        );

      if (existingPromotion) {
        throw new AppError("Promotion code already exists", 400);
      }
    }

    switch (payload.type) {
      case PromotionType.FIXED:
        if (!payload.discountValue || payload.discountValue <= 0) {
          throw new AppError("Discount value is required", 400);
        }

        if (payload.maximumDiscountAmount) {
          throw new AppError(
            "Maximum discount amount is not applicable for fixed promotions",
            400,
          );
        }

        break;

      case PromotionType.PERCENTAGE:
        if (!payload.discountValue || payload.discountValue <= 0) {
          throw new AppError("Discount value is required", 400);
        }

        if (payload.discountValue > 90) {
          throw new AppError("Percentage discount cannot exceed 90%", 400);
        }

        if (!payload.maximumDiscountAmount || payload.maximumDiscountAmount <= 0) {
          throw new AppError("Maximum discount amount is required for percentage promotions", 400);
        }

        break;

      case PromotionType.FREE_DELIVERY:
        if (payload.discountValue) {
          throw new AppError(
            "Discount value is not allowed for free delivery promotion",
            400,
          );
        }

        if (payload.maximumDiscountAmount) {
          throw new AppError(
            "Maximum discount amount is not applicable for free delivery promotions",
            400,
          );
        }

        break;

      case PromotionType.BOGO:
        if (payload.discountValue) {
          throw new AppError(
            "Discount value is not allowed for BOGO promotion",
            400,
          );
        }

        if (!payload.menuItemIds || payload.menuItemIds.length === 0) {
          throw new AppError(
            "At least one menu item is required for BOGO",
            400,
          );
        }

        if (payload.minimumOrderAmount) {
          throw new AppError(
            "Minimum order amount is not applicable for BOGO promotions",
            400,
          );
        }

        const menuItems = await this.promotionRepo.validateMenuItems(
          restaurantId,
          payload.menuItemIds,
        );

        if (menuItems.length !== payload.menuItemIds.length) {
          throw new AppError("One or more menu items are invalid", 400);
        }

        break;
    }

    const promotion = await prisma.$transaction(async (tx) => {
      const createdPromotion = await tx.restaurantPromotion.create({
        data: {
          restaurantId,
          title: payload.title.trim(),
          type: payload.type,
          startDate,
          endDate,
          discountValue: payload.discountValue ?? 0,
          minimumOrderAmount: payload.minimumOrderAmount,
          maximumDiscountAmount: payload.maximumDiscountAmount,
          ...(code && { code }),
        },
      });

      if (payload.type === PromotionType.BOGO) {
        await (tx as any).promotionMenuItem.createMany({
          data: payload.menuItemIds!.map((menuItemId) => ({
            promotionId: createdPromotion.id,

            menuItemId,
          })),
        });
      }

      return createdPromotion.id;
    });

    const createdPromotion =
      await this.promotionRepo.getPromotionById(promotion);

    return {
      success: true,

      data: createdPromotion!,

      message: "Promotion created successfully",

      statusCode: 201,
    };
  }

  async validatePromotionOwnership(
    promotionId: string,
    userId: string,
  ): Promise<ServiceResponse<IPromotionValidation>> {
    const promotion =
      await this.promotionRepo.validatePromotionById(promotionId);

    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }

    if (promotion.isDeleted) {
      throw new AppError("Promotion already deleted", 400);
    }

    await this.restaurantService.validateRestaurantOwnership(
      promotion.restaurantId,
      userId,
    );

    return {
      success: true,
      data: promotion,
      message: "Promotion validated successfully",
      statusCode: 200,
    };
  }

  // delete promotion
  async deletePromotion(
    promotionId: string,
    userId: string,
  ): Promise<ServiceResponse<IDeletePromotionResponse>> {
    await this.validatePromotionOwnership(promotionId, userId);
    const promotion = await this.promotionRepo.deletePromotion(promotionId);

    return {
      success: true,
      data: promotion,
      message: "Promotion deleted successfully",
      statusCode: 200,
    };
  }

  // toggle promotion status
  async togglePromotionStatus(
    promotionId: string,
    userId: string,
    isActive: boolean
  ): Promise<ServiceResponse<any>> {
    await this.validatePromotionOwnership(promotionId, userId);
    const promotion = await this.promotionRepo.togglePromotionStatus(promotionId, isActive);

    return {
      success: true,
      data: promotion,
      message: `Promotion ${isActive ? 'activated' : 'deactivated'} successfully`,
      statusCode: 200,
    };
  }

  async getRestaurantPromotions(
    restaurantId:string
): Promise<
    ServiceResponse<
        IRestaurantPromotionsResponse
    >
>{

    const restaurant =
    await this.restaurantRepo
    .validateRestaurantById(
        restaurantId
    );

    if(!restaurant){

        throw new AppError(
            "Restaurant not found",
            404
        );

    }

    if(restaurant.isDeleted){

        throw new AppError(
            "Restaurant has been deleted",
            404
        );

    }

    if(!restaurant.isActive){

        throw new AppError(
            "Restaurant is inactive",
            400
        );

    }

    const promotions =
    await this.promotionRepo
    .getAllPromotions(
        restaurantId
    );

    return {

        success:true,

        data:{
            promotions
        },

        message:
        "Promotions fetched successfully",

        statusCode:200

    };

}
}
