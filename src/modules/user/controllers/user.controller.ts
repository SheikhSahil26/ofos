import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { IUpdateUser } from "../interfaces/user.interface";

export class UserController{
                                                                                  
    private userService = new UserService();
    
    //get profile of authenticated user
    getProfile = async(req: Request, res: Response) => {
        try{
            //from token we will get user id
            const userId = req.user.id;

            if(typeof userId !== 'string'){
                return res.status(400).json({success: false, message: "Invalid user id"});
            }

            const profile = await this.userService.getProfile(userId);
            res.status(200).json({success: true, data: profile});
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "Error getting profile"});
        }
    }

    //edit user profile 
    updateProfile = async(req: Request, res: Response) => {
        try{
            //from token we will get user id
            const userId = req.user.id;

            if(typeof userId !== 'string'){
                return res.status(400).json({success: false, message: "Invalid user id"});
            }

            //mapping data from request body and file to IUpdateUser interface
            const data: IUpdateUser = {
                fullName: req.body.fullName,
                mobile: req.body.mobile
            };

            if(req.file){
                data.profilePhoto = req.file.path;
            }

            const profile = await this.userService.updateProfile(userId, data);
            res.status(200).json({success: true, data: profile});
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "Error updating profile"});
        }
    }

    //delete profile photo
    deleteProfilePhoto = async(req: Request, res: Response) => {
        try{
            const userId = req.user.id;

            const user = await this.userService.deletePofilePhoto(userId);
            res.status(200).json({success: true, data: user});
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "Error removing profile photo"});
        }
    }

    //delete user account
    deleteUserAccount = async(req: Request, res: Response) => {
        try{
            //from token we will get user id
            const userId = req.user.id;

            if(typeof userId !== 'string'){
                return res.status(400).json({success: false, message: "Invalid user id"});
            }

            await this.userService.deleteProfile(userId);
            res.status(200).json({success: true, message: "Profile deleted successfully"});
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "Error deleting profile"});
        }
    }
}