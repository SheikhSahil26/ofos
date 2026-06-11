import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";
import { ISignupDto } from "../../auth/interfaces/auth.interface";
import { RestaurantStaffService } from "../services/restaurantStaff.service";
import { Request, Response } from "express";

export class RestaurantStaffController{
    
    private staffService = new RestaurantStaffService();

    //get all the staff of particular branch
    getStaffByBranch = asyncHandler( async(req: Request, res: Response) => {
        const branchId = req.params.branchId;

        if(typeof branchId !== "string"){
            throw new AppError("Invalid branch id");
        }

        const response = await this.staffService.getStaffByBranch(branchId);

        res.status(response.statusCode || 200).json(response);
    });

    //add staff
    addStaff = asyncHandler( async(req: Request, res: Response) => {
        const branchId = req.params.branchId;

        if(typeof branchId !== "string"){
            throw new AppError("Invalid branch id");
        }

        const data: ISignupDto = {
            fullName: req.body.fullName,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
        }

        const response = await this.staffService.addStaff(branchId, data);

        res.status(response.statusCode || 200).json(response);
    });

    //remove staff
    removeStaff = asyncHandler( async(req: Request, res: Response) => {
        const branchId = req.params.branchId;
        const userId = req.params.userId;

        if(typeof branchId !== "string" || typeof userId !== "string"){
            throw new AppError("Invalid user or branch id");
        }

        const response = await this.staffService.removeStaff(branchId, userId);

        res.status(response.statusCode || 200).json(response);
    });
}