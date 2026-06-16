import { prisma } from "../../../config/prisma";
import { ICreateCoupon, IGetCouponsFilters, IUpdateCoupon } from "../interfaces/coupon.interface";

export class CouponRepository{
    //create coupon by admin
    async createCoupon(data: ICreateCoupon) {
        return prisma.coupon.create({
            data,
        });
    }

    //helper for create 
    async getCouponByCode(code: string) {
        return prisma.coupon.findFirst({
            where: {
                code,
                isDeleted: false,
            },
        });
    }

    //update coupon (admin)
    async updateCoupon(id: string, data: IUpdateCoupon) {
        return prisma.coupon.update({
            where: {
                id,
            },
            data,
        });
    }

    //helper for update and get coupon by id
    async getCouponById(id: string) {
        return prisma.coupon.findFirst({
            where: {
                id,
                isDeleted: false,
            },
        });
    }

    //active deactive coupon(admin)
    async updateCouponStatus(id: string, isActive: boolean) {
        return prisma.coupon.update({
            where: {
                id,
            },
            data: {
                isActive,
            },
        });
    }

    //soft delete coupon (admin)
    async softDeleteCoupon(id: string) {
        return prisma.coupon.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                isActive: false,
            },
        });
    }

    //get all the active coupons(user)
    async getActiveCoupons() {
        const now = new Date();

        return prisma.coupon.findMany({
            where: {
            isActive: true,
            isDeleted: false,
            AND: [
                {
                OR: [
                    { startDate: null },
                    { startDate: { lte: now } },
                ],
                },
                {
                OR: [
                    { endDate: null },
                    { endDate: { gte: now } },
                ],
                },
            ],
            },
            orderBy: {
            createdAt: "desc",
            },
        });
    }

    async getCouponUsageCount(couponId: string) {
        return prisma.couponUsage.count({
            where: {
                couponId,
            },
        });
    }

    async hasCustomerUsedCoupon(customerId: string, couponId: string) {
        return prisma.couponUsage.findFirst({
            where: {
            customerId,
            couponId,
            },
        });
    }

    //add in coupon usage table after order is placed
    async createCouponUsage(data: {
        couponId: string;
        customerId: string;
        orderId: string;
    }) {
        return prisma.couponUsage.create({
            data: {
                couponId: data.couponId,
                customerId: data.customerId,
                orderId: data.orderId,
                usedAt: new Date(),
            },
        });
    }

    //get the coupon usage stats (admin)
    async getCouponUsageStats(couponId: string) {
        return prisma.coupon.findUnique({
            where: { id: couponId },
            include: {
            couponUsages: {
                include: {
                order: true,
                customer: {
                    select: {
                    id: true,
                    fullName: true,
                    email: true,
                    },
                },
                },
            },
            },
        });
    }

    //list coupons with filters
    async getCoupons(filters: IGetCouponsFilters) {
        const { code, type, isActive, isDeleted } = filters;

        return prisma.coupon.findMany({
            where: {
                ...(code && {
                    code: {
                        contains: code,
                    },
                }),

                ...(type && { type }),

                ...(typeof isActive === "boolean" && {
                    isActive,
                }),

                ...(typeof isDeleted === "boolean" && {
                    isDeleted,
                }),
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    }
}