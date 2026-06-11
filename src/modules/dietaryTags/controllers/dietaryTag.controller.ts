import { DietaryTagService } from "../services/dietaryTag.service";
import { Request, Response } from "express";

export class DietaryTagController{
    private dietaryTagService = new DietaryTagService();

    //get all dietary tags
    getAllDietaryTags = async(req: Request, res: Response) => {
        try{
            const data = await this.dietaryTagService.getDietaryTags();
            res.status(200).json({success: true, data: data});
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "Error getting dietary tags"});
        }
    }

    //create dietary tag
    createDietaryTag = async(req: Request, res: Response) => {
        try{
            const name = req.body.name;

            await this.dietaryTagService.createDietaryTag(name);
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "Error creating dietary tags"});
        }
    }

    //update dietary tag
    updateDietaryTag = async(req: Request, res: Response) => {
        try{
            const name = req.body.name;
            const id = req.params.id;

            if(typeof id !== "string"){
                throw new Error("Invalid dietary tag id");
            }

            await this.dietaryTagService.updateDietaryTag(id, name);
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "Error updating dietary tags"});
        }
    }

    //delete dietary tag
    deleteDietaryTag = async(req: Request, res: Response) => {
        try{
            const id = req.params.id;

            if(typeof id !== "string"){
                throw new Error("Invalid dietary tag id");
            }

            await this.dietaryTagService.deleteDietaryTag(id);
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "Error deleting dietary tags"});
        }
    }
}