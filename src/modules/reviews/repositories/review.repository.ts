import { prisma } from "../../../config/prisma";
import { Review } from "@prisma/client";
import { ICreateReview } from "../interfaces/review.interface";

export class ReviewRepository {

    async getReviewByOrderId(orderId: string) {
        return prisma.review.findFirst({
            where: {
                orderId,
                isDeleted: false,
            },
        });
    }

    async createReview(data: ICreateReview) {
        return prisma.review.create({
            data,
        });
    }

    //helper to get the delivery partner id
    async getDeliveryByOrderId(orderId: string) {
      return prisma.delivery.findUnique({
          where: {
              orderId,
          },
      });
  }

    //get all reviews of a branch
    async getBranchReviews(
        branchId: string,
        page: number,
        limit: number
    ) {
        const [reviews, total] = await prisma.$transaction([
            prisma.review.findMany({
                where: {
                    branchId,
                    isDeleted: false,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            profilePicture: true, // remove if your User model doesn't have this
                        },
                    },
                    images: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip: (page - 1) * limit,
                take: limit,
            }),

            prisma.review.count({
                where: {
                    branchId,
                    isDeleted: false,
                },
            }),
        ]);

        return {
            reviews,
            total,
        };
    }
}