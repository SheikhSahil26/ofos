import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  ICreatedPromotion,
  IDeletePromotionResponse,
  IPromotionValidation,
  IRestaurantPromotion,
} from "../interface/promotion.interface";

export class RestaurantPromotionRepository {
  // Validate promotion code exist
  async validateActivePromotionCode(
    restaurantId: string,
    code: string,
  ): Promise<{ id: string } | null> {
    const today = new Date();

    return await prisma.restaurantPromotion.findFirst({
      where: {
        restaurantId,
        code,
        isDeleted: false,
        isActive: true,
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
      },
      select: {
        id: true,
      },
    });
  }

  // validate menu items
  async validateMenuItems(
    restaurantId: string,
    menuItemIds: string[],
  ): Promise<{ id: string }[]> {
    return await prisma.menuItem.findMany({
      where: {
        id: {
          in: menuItemIds,
        },
        isDeleted: false,
        category: {
          isDeleted: false,
          branch: {
            restaurantId,
            isDeleted: false,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  // create promotion
  async createPromotion(
    payload: Prisma.RestaurantPromotionCreateInput,
  ): Promise<ICreatedPromotion> {
    return await prisma.restaurantPromotion.create({
      data: payload,
      select: {
        id: true,
        restaurantId: true,
        title: true,
        code: true,
        type: true,
        discountValue: true,
        minimumOrderAmount: true,
        maximumDiscountAmount: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
    });
  }

  async getPromotionById(id: string): Promise<ICreatedPromotion | null> {
    return await prisma.restaurantPromotion.findFirst({
      where: {
        id,
        isDeleted: false,
      },

      select: {
        id: true,
        restaurantId: true,
        title: true,
        code: true,
        type: true,
        discountValue: true,
        minimumOrderAmount: true,
        maximumDiscountAmount: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
    });
  }

  // Validate promotion
  async validatePromotionById(
    id: string,
  ): Promise<IPromotionValidation | null> {
    return await prisma.restaurantPromotion.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        restaurantId: true,
        isDeleted: true,
        isActive: true,
      },
    });
  }

  // delete promotion
  async deletePromotion(id: string): Promise<IDeletePromotionResponse> {
    return await prisma.restaurantPromotion.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },

      select: {
        id: true,
        title: true,
        code: true,
        isDeleted: true,
        deletedAt: true,
      },
    });
  }

  // toggle promotion status
  async togglePromotionStatus(id: string, isActive: boolean) {
    return await prisma.restaurantPromotion.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        title: true,
        isActive: true,
      },
    });
  }

  // get all promotions for a restaurant
  async getAllPromotions(
    restaurantId:string
): Promise<IRestaurantPromotion[]>{

    return await prisma
    .restaurantPromotion
    .findMany({
        where:{
            restaurantId,
            isDeleted:false,
        },
        select:{
            id:true,
            title:true,
            code:true,
            type:true,
            discountValue:true,
            minimumOrderAmount:true,
            maximumDiscountAmount:true,
            startDate:true,
            endDate:true,
            isActive:true
        },
        orderBy:{
            startDate:"desc"
        }
    });
}

  // get active promotions for a restaurant
  async getActivePromotions(
    restaurantId: string
  ): Promise<IRestaurantPromotion[]> {
    const today = new Date();
    return await prisma.restaurantPromotion.findMany({
      where: {
        restaurantId,
        isDeleted: false,
        isActive: true,
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
      },
      select: {
        id: true,
        title: true,
        code: true,
        type: true,
        discountValue: true,
        minimumOrderAmount: true,
        maximumDiscountAmount: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });
  }
}
