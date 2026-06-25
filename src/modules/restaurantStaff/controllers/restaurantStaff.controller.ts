import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";
import { ISignupDto } from "../../auth/interfaces/auth.interface";
import { RestaurantStaffService } from "../services/restaurantStaff.service";
import { Request, Response } from "express";
import { RestaurantStaffValidation } from "../validations/restaurantStaff.validation";

export class RestaurantStaffController{
    
    private staffService = new RestaurantStaffService();

    //get all the staff of particular branch
    getStaffByBranch = asyncHandler( async(req: Request, res: Response) => {
        const branchId = req.params.branchId;

        if(typeof branchId !== "string"){
            throw new AppError("Invalid branch id");
        }

        RestaurantStaffValidation.validateId(branchId, "branch id");

        const response = await this.staffService.getStaffByBranch(branchId);

        res.status(response.statusCode || 200).json(response);
    });

    //add staff
    addStaff = asyncHandler( async(req: Request, res: Response) => {
        const branchId = req.params.branchId;

        if(typeof branchId !== "string"){
            throw new AppError("Invalid branch id");
        }

        RestaurantStaffValidation.validateId(branchId, "branch id");

        const data: ISignupDto = {
            fullName: req.body.fullName,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
        }

        RestaurantStaffValidation.validateAddStaff(data);

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

        RestaurantStaffValidation.validateId(branchId, "branch id");
        RestaurantStaffValidation.validateId(userId, "user id");

        const response = await this.staffService.removeStaff(branchId, userId);

        res.status(response.statusCode || 200).json(response);
    });

    //check email
    checkEmail = asyncHandler( async(req: Request, res: Response) => {
        const branchId = req.params.branchId;
        const email = req.body.email;

        if(typeof branchId !== "string"){
            throw new AppError("Invalid branch id");
        }

        if(!email || typeof email !== "string"){
            throw new AppError("Invalid email");
        }

        RestaurantStaffValidation.validateId(branchId, "branch id");

        const response = await this.staffService.checkEmailAndAssign(branchId, email);

        res.status(response.statusCode || 200).json(response);
    });

    //change branch head
    changeBranchHead = asyncHandler( async(req: Request, res: Response) => {
        const branchId = req.params.branchId;
        const staffId = req.body.staffId;

        if(typeof branchId !== "string" || typeof staffId !== "string"){
            throw new AppError("Invalid branch or staff id");
        }

        RestaurantStaffValidation.validateId(branchId, "branch id");
        RestaurantStaffValidation.validateId(staffId, "staff id");

        const response = await this.staffService.changeBranchHead(branchId, staffId);

        res.status(response.statusCode || 200).json(response);
    });
}