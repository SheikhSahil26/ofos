import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { IUpdateUser } from "../interfaces/user.interface";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { uploadImage } from "../../../services/multer.service";

export class UserController {
    private userService = new UserService();

    //get profile of authenticated user
    getProfile = asyncHandler(async (req: Request, res: Response) => {

        //from token we will get user id
        const user = req.user as Express.payload;
        const userId = user.userId;

        if (typeof userId !== 'string') {
            return res.status(400).json({ success: false, message: "Invalid user id" });
        }

        const response = await this.userService.getProfile(userId);

        res.status(response.statusCode || 200).json(response);
    });

    //edit user profile 
    updateProfile = asyncHandler(async (req: Request, res: Response) => {

        //from token we will get user id
        const userId = "05dc33d4-6713-4f32-a59e-6a50e8420934";

        if (typeof userId !== 'string') {
            return res.status(400).json({ success: false, message: "Invalid user id" });
        }

        //mapping data from request body and file to IUpdateUser interface
        const data: IUpdateUser = {
            fullName: req.body?.fullName,
            mobile: req.body?.mobile
        };

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
    deleteProfilePhoto = asyncHandler(async (req: Request, res: Response) => {

        const userId = req.user.id;

        const response = await this.userService.deletePofilePhoto(userId);

        res.status(response.statusCode || 200).json(response);
    });

    //delete user account
    deleteUserAccount = asyncHandler(async (req: Request, res: Response) => {

        //from token we will get user id
        const userId = req.user.id;

        if (typeof userId !== 'string') {
            return res.status(400).json({ success: false, message: "Invalid user id" });
        }

        const response = await this.userService.deleteUserAccount(userId);

        res.status(response.statusCode || 200).json(response);
    });
}