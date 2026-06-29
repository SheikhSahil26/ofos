import { OrderStatus, Review } from "@prisma/client";
import { AppError } from "../../../utils/appError";
import { OrdersRepository } from "../../orders/repositories/orders.repository";
import { ICreateReview, ICreateReviewDto } from "../interfaces/review.interface";
import { ReviewRepository } from "../repositories/review.repository";
import { DeliveryRepository } from "../../delivery/repositories/delivery.repository";
import { ServiceResponse } from "../../../common/types/service-response.types";
import { BranchRepository } from "../../restaurantBranch/repositories/branch.repo";

export class ReviewService{

    private reviewRepository = new ReviewRepository();
    private orderRepository = new OrdersRepository();
    private branchRepository = new BranchRepository();
    
    async createReview(
        userId: string,
        data: ICreateReviewDto
    ): Promise<ServiceResponse<Review>> {
        const order =
            await this.orderRepository.getOrderById(data.orderId);

        if (!order) {
            throw new AppError(
                "Order not found",
                404
            );
        }

        if (order.address.userId !== userId) {
            throw new AppError(
                "You can only review your own orders",
                403
            );
        }

        if (order.status !== OrderStatus.DELIVERED) {
            throw new AppError(
                "Only delivered orders can be reviewed",
                400
            );
        }

        const existingReview =
            await this.reviewRepository.getReviewByOrderId(
                data.orderId
            );

        if (existingReview) {
            throw new AppError(
                "Review already submitted for this order",
                409
            );
        }

        const delivery =
            await this.reviewRepository.getDeliveryByOrderId(
                data.orderId
            );

        const review = await this.reviewRepository.createReview({
            orderId: order.id,
            userId,
            branchId: order.branchId,
            deliveryPartnerId: delivery?.currentPartnerId ?? undefined,
            foodRating: data.foodRating,
            deliveryRating: data.deliveryRating,
            packagingRating: data.packagingRating,
            reviewText: data.reviewText,
        } as ICreateReview);

          return {
            success: true,
            data: review,
            message: "Review created successfully",
            statusCode: 201,
        };
    }

    // Get reviews of all branches or a specific branch
    async getReviews(
        ownerId: string,
        page: number,
        limit: number
    ) {

        const { reviews, total } =
            await this.reviewRepository.getReviews(
                ownerId,
                page,
                limit
            );

        return {
            success: true,
            data: {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
            message: "Reviews fetched successfully",
            statusCode: 200,
        };
    }
}