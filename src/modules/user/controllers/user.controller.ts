import { Request, Response } from "express";

export class UserController{
    
    //get profile of authenticated user
    getProfile = async(req: Request, res: Response) => {
        try{
            
            console.log("user profile");
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "Error getting profile"});
        }
    }

    //edit user profile 
    updateProfile = async(req: Request, res: Response) => {
        try{

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