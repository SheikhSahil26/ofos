import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { IUpdateUser } from "../interfaces/user.interface";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { uploadImage } from "../../../services/multer.service";
import { UserValidation } from "../validations/user.validation";
import { AppError } from "../../../utils/appError";

export class UserController {
    private userService = new UserService();

    //dashboard page
    dashboardPage = asyncHandler( async(req: Request, res: Response) => {
        res.status(200).render("customer/dashboard");
    });

    //get profile page
    getProfilePage = asyncHandler(async(req: Request, res: Response) => {
        res.status(200).render("customer/profile");
    });
    
    //get profile of authenticated user
    getProfile = asyncHandler(async (req: Request, res: Response) => {

        const user = req.user as Express.payload | undefined;

        if(!user || typeof user.userId !== "string"){
            throw new AppError("Invalid user id", 409);
        }

        const userId = user.userId;

        UserValidation.validateUserId(userId);

        const response = await this.userService.getProfile(userId);

        res.status(response.statusCode || 200).json(response);
    });

    //edit user profile 
    updateProfile = asyncHandler(async (req: Request, res: Response) => {

        const user = req.user as Express.payload | undefined;

        if(!user || typeof user.userId !== "string"){
            throw new AppError("Invalid user id", 409);
        }

        const userId = user.userId;
       
        UserValidation.validateUserId(userId);

        //mapping data from request body and file to IUpdateUser interface
        const data: IUpdateUser = {
            fullName: req.body?.fullName,
            mobile: req.body?.mobile
        };

        //validating fullName and mobile
        UserValidation.validateUpdateProfile(data);

        let imageurl: string | undefined;

        if (req.file) {
            imageurl = await uploadImage(
                req.file.buffer,
                `profile-${userId}-${Date.now()}`,
                "/OFOS/profiles",
            );

            data.profilePhoto = imageurl;
        }

        const response = await this.userService.updateProfile(userId, data);

        res.status(response.statusCode || 200).json(response);
    });

    //delete profile photo
    deleteProfilePhoto = asyncHandler(async(req: Request, res: Response) => {
        
        const user = req.user as Express.payload | undefined;

        if(!user || typeof user.userId !== "string"){
            throw new AppError("Invalid user id", 409);
        }

        const userId = user.userId;

        UserValidation.validateUserId(userId);

        const response = await this.userService.deletePofilePhoto(userId);

        res.status(response.statusCode || 200).json(response);
    });

    //delete user account
    deleteUserAccount = asyncHandler(async (req: Request, res: Response) => {

        const user = req.user as Express.payload | undefined;

        if(!user || typeof user.userId !== "string"){
            throw new AppError("Invalid user id", 409);
        }

        const userId = user.userId;
 
        UserValidation.validateUserId(userId);

        const response = await this.userService.deleteUserAccount(userId);

        res.status(response.statusCode || 200).json(response);
    });
}