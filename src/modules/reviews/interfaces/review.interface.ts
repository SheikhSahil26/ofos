export interface ICreateReview {
    orderId: string;
    userId: string;
    branchId: string;
    deliveryPartnerId?: string;
    foodRating: number;
    deliveryRating: number;
    packagingRating: number;
    reviewText?: string;
}

export interface ICreateReviewDto {
    orderId: string;
    foodRating: number;
    deliveryRating: number;
    packagingRating: number;
    reviewText?: string;
}