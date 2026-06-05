import { Request, Response } from "express";
import { UserServices } from "../services/user.service";

export class UserController{                                                                                   
    
    private userService = new UserServices();
    //get profile of authenticated user
    getProfile = async(req: Request, res: Response) => {
        try{
            
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "Error getting profile"});
        }
    }

    //edit user profile 
    updateProfile = async(req: Request, res: Response) => {
        try{
            const userId = req.params.id;
            if(typeof userId !== 'string'){
                return res.status(400).json({success: false, message: "Invalid user id"});
            }
            const data = req.body;
            const user = await this.userService.updateProfile(userId, data);
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "Error updating profile"});
        }
    }

    //delete user account
    deleteUserAccount = async(req: Request, res: Response) => {
        try{

        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "Error deleting profile"});
        }
    }
}