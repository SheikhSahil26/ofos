import { prisma } from "../../../config/prisma";
import { ICreateCoupon, IUpdateCoupon } from "../interfaces/coupon.interface";

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
}