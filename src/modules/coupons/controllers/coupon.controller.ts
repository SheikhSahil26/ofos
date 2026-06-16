import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";
import { CouponService } from "../services/coupon.service";
import { Request, Response } from "express";
import { createCouponSchema, updateCouponSchema, updateCouponStatusSchema, validateCouponSchema } from "../validations/coupon.validation";
import { IGetCouponsFilters } from "../interfaces/coupon.interface";
import { CouponType } from "@prisma/client";

export class CouponController{

    private couponService = new CouponService();

    //create new coupon (admin)
    createCoupon = asyncHandler(async (req: Request,res: Response) => {

        const { error } = createCouponSchema.validate(req.body);

        if (error) {
            throw new AppError(error.details[0]?.message || "Validation failed", 400);
        }

        const response = await this.couponService.createCoupon(req.body);

        res.status(response.statusCode || 201).json(response);
    });

    //update coupon details (admin)
    updateCoupon = asyncHandler(async (req, res) => {

        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("ID is required", 400);
        }

        const { error } = updateCouponSchema.validate(req.body);

        if (error) {
            throw new AppError(
                error.details[0]?.message ||
                "Validation failed",
                400
            );
        }

        const response = await this.couponService.updateCoupon(id,req.body);

        res.status(response.statusCode || 200).json(response);
    });

    //active deactive coupon (admin)
    updateCouponStatus = asyncHandler(async (req, res) => {

        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("ID is required", 400);
        }

        const { error } = updateCouponStatusSchema.validate(req.body);

        if (error) {
            throw new AppError(error.details[0]?.message || "Validation failed", 400);
        }

        const response = await this.couponService.updateCouponStatus(id,req.body);

        res.status(response.statusCode || 200).json(response);
    });

    //soft delete coupon
    deleteCoupon = asyncHandler(async (req, res) => {

        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("ID is required", 400);
        }

        const response = await this.couponService.deleteCoupon(id);

        res.status(response.statusCode || 200).json(response);
    });

    //get all the active coupons (user)
    getActiveCoupons = asyncHandler(async (req, res) => {
        
        const response = await this.couponService.getActiveCoupons();

        res.status(response.statusCode || 200).json(response);
    });

    //get coupon by id
    getCouponById = asyncHandler(async (req, res) => {

        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("ID is required", 400);
        }

        const response = await this.couponService.getCouponById(id);

        res.status(response.statusCode || 200).json(response);
    });

    //validate coupon
    validateCoupon = asyncHandler(async (req, res) => {

        const { error } = validateCouponSchema.validate(req.body);

        if (error) {
            throw new AppError(error.details[0]?.message || "Validation failed", 400);
        }

        const response = await this.couponService.validateCoupon(req.body);

        res.status(response.statusCode || 200).json(response);
    });

    //coupon usage stats (admin)
    getCouponUsageStats = asyncHandler(async (req, res) => {

        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("ID is required", 400);
        }

        const response = await this.couponService.getCouponUsageStats(id);

        res.status(response.statusCode || 200).json(response);
    });

    // list coupons with filters(admin)
    getCoupons = asyncHandler(async (req, res) => {

        const filters: IGetCouponsFilters = {
            code: req.query.code as string,
            type: req.query.type as CouponType,

            isActive:
                req.query.isActive !== undefined
                    ? req.query.isActive === "true"
                    : undefined,

            isDeleted:
                req.query.isDeleted !== undefined
                    ? req.query.isDeleted === "true"
                    : undefined,
        };

        const response =
            await this.couponService.getCoupons(filters);

        res.status(response.statusCode || 200).json(response);
    });
}