import { Coupon, CouponType } from "@prisma/client";
import { ICouponUsageStats, ICreateCoupon, IGetCouponsFilters, IUpdateCoupon, IUpdateCouponStatus, IValidateCoupon, IValidateCouponResponse } from "../interfaces/coupon.interface";
import { CouponRepository } from "../repositories/coupon.repository";
import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";

export class CouponService{
    private couponRepository = new CouponRepository();

    //create coupon
    async createCoupon(data: ICreateCoupon): Promise<ServiceResponse<Coupon>> {

        const existingCoupon = await this.couponRepository.getCouponByCode(data.code);

        if (existingCoupon) {
            throw new AppError("Coupon code already exists", 409);
        }

        if (data.type === "PERCENTAGE" && data.discountValue > 100) {
            throw new AppError("Percentage discount cannot exceed 100%", 400);
        }

        const coupon = await this.couponRepository.createCoupon(data);

        return {
            success: true,
            data: coupon,
            message: "Coupon created successfully",
            statusCode: 201,
        };
    }

    //update coupon details (admin)
    async updateCoupon(id: string, data: IUpdateCoupon): Promise<ServiceResponse<Coupon>> {

        const coupon = await this.couponRepository.getCouponById(id);

        if (!coupon) {
            throw new AppError("Coupon not found",404);
        }

        // Prevent duplicate coupon codes
        if (data.code) {
            const existingCoupon = await this.couponRepository.getCouponByCode(data.code);

            if (existingCoupon && existingCoupon.id !== id) {
                throw new AppError("Coupon code already exists",409);
            }
        }

        const type = data.type ?? coupon.type;

        const discountValue = data.discountValue ?? Number(coupon.discountValue);

        const startDate = data.startDate ?? coupon.startDate;

        const endDate = data.endDate ?? coupon.endDate;

        if (type === "PERCENTAGE" && discountValue > 100) {
            throw new AppError("Percentage discount cannot exceed 100%", 400);
        }

        if (startDate && endDate && startDate >= endDate) {
            throw new AppError("End date must be after start date",400);
        }

        const updatedCoupon = await this.couponRepository.updateCoupon(id,data);

        return {
            success: true,
            message: "Coupon updated successfully",
            data: updatedCoupon,
            statusCode: 200,
        };
    }

    //active deactive coupon
    async updateCouponStatus(id: string,data: IUpdateCouponStatus): Promise<ServiceResponse<Coupon>> {

        const coupon = await this.couponRepository.getCouponById(id);

        if (!coupon) {
            throw new AppError("Coupon not found", 404);
        }

        const updatedCoupon = await this.couponRepository.updateCouponStatus(id, data.isActive);

        return {
            success: true,
            message: `Coupon ${
                data.isActive
                    ? "activated"
                    : "deactivated"
            } successfully`,
            data: updatedCoupon,
            statusCode: 200,
        };
    }

    //soft delete coupon(admin)
    async deleteCoupon(id: string): Promise<ServiceResponse<null>> {
        const coupon = await this.couponRepository.getCouponById(id);

        if (!coupon) {
            throw new AppError("Coupon not found", 404);
        }

        await this.couponRepository.softDeleteCoupon(id);

        return {
            success: true,
            message: "Coupon deleted successfully",
            statusCode: 200,
        };
    }

    //activate deactivate coupon
    async getActiveCoupons(): Promise<ServiceResponse<Coupon[]>> {

        const coupons = await this.couponRepository.getActiveCoupons();

        return {
            success: true,
            message: "Coupons fetched successfully",
            data: coupons,
            statusCode: 200,
        };
    }

    //get coupon by id
    async getCouponById(id: string): Promise<ServiceResponse<Coupon>> {
        const coupon = await this.couponRepository.getCouponById(id);

        if (!coupon) {
            throw new AppError("Coupon not found", 404);
        }

        return {
            success: true,
            message: "Coupon fetched successfully",
            data: coupon,
            statusCode: 200,
        };
    }

    //validate coupon with the order 
    async validateCoupon(data: IValidateCoupon): Promise<ServiceResponse<IValidateCouponResponse>> {
        const coupon = await this.couponRepository.getCouponByCode(
            data.couponCode
        );

        if (!coupon) {
            throw new AppError("Invalid coupon code", 404);
        }

        if (!coupon.isActive) {
            throw new AppError("Coupon is inactive", 400);
        }

        const now = new Date();

        if (coupon.startDate && coupon.startDate > now) {
            throw new AppError("Coupon is not active yet", 400);
        }

        if (coupon.endDate && coupon.endDate < now) {
            throw new AppError("Coupon has expired", 400);
        }

        //customer id will come from the athentication middleware
        let customerId = "1";
        const alreadyUsed = await this.couponRepository.hasCustomerUsedCoupon(customerId,coupon.id);

        if (alreadyUsed) {
            throw new AppError(
                "You have already used this coupon",
                400
            );
        }

        if (
            coupon.minOrderAmount &&
            data.orderAmount < Number(coupon.minOrderAmount)
        ) {
            throw new AppError(
            `Minimum order amount is ₹${coupon.minOrderAmount}`,
            400
            );
        }

        if (coupon.usageLimit) {
            const usageCount = await this.couponRepository.getCouponUsageCount(coupon.id);

            if (usageCount >= coupon.usageLimit) {
                throw new AppError("Coupon usage limit reached", 400);
            }
        }

        let discount = 0;

        if (coupon.type === CouponType.FLAT) {
            discount = Number(coupon.discountValue);
        }

        if (coupon.type === CouponType.PERCENTAGE) {
            discount = (data.orderAmount * Number(coupon.discountValue)) / 100;

            if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
                discount = Number(coupon.maxDiscount);
            }
        }

        if (coupon.type === CouponType.FREE_DELIVERY) {
            discount = data.deliveryFee;
        }

        const finalAmount = data.orderAmount - discount;

        return {
            success: true,
            message: "Coupon applied successfully",
            data: {
                couponId: coupon.id,
                couponCode: coupon.code,
                couponType: coupon.type,
                discount,
                finalAmount,
                freeDelivery: coupon.type === CouponType.FREE_DELIVERY,
            },
            statusCode: 200,
        };
    }

    //coupon usage stats (admin)
    async getCouponUsageStats(couponId: string): Promise<ServiceResponse<ICouponUsageStats>> {

        const coupon =
            await this.couponRepository.getCouponUsageStats(couponId);

        if (!coupon || coupon.isDeleted) {
            throw new AppError("Coupon not found", 404);
        }

        const totalUsageCount = coupon.couponUsages.length;

        const uniqueCustomers = new Set(
            coupon.couponUsages.map(
            usage => usage.customerId
            )
        ).size;

        const totalRevenueGenerated = coupon.couponUsages.reduce(
            (sum, usage) => sum + Number(usage.order.totalAmount),
            0
        );

        const totalDiscountGiven =
            coupon.couponUsages.reduce((sum, usage) => {

            if (coupon.type === CouponType.FLAT) {
                return sum + Number(coupon.discountValue);
            }

            return sum;
            }, 0);

        return {
            success: true,
            message: "Coupon usage statistics fetched successfully",
            data: {
            couponId: coupon.id,
            couponCode: coupon.code,
            usageLimit: coupon.usageLimit,
            totalUsageCount,
            uniqueCustomers,
            remainingUsage:
                coupon.usageLimit
                ? coupon.usageLimit - totalUsageCount
                : null,
            totalRevenueGenerated,
            totalDiscountGiven,
            recentUsages: coupon.couponUsages
                .slice(-10)
                .reverse()
                .map(usage => ({
                orderId: usage.orderId,
                customerName: usage.customer.fullName,
                usedAt: usage.usedAt,
                })),
            },
            statusCode: 200,
        };
    }

    async getCoupons(
        filters: IGetCouponsFilters
    ): Promise<ServiceResponse<Coupon[]>> {

        const coupons =
            await this.couponRepository.getCoupons(filters);

        return {
            success: true,
            message: "Coupons fetched successfully",
            data: coupons,
            statusCode: 200,
        };
    }
}