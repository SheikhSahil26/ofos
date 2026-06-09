import { IDietaryTag } from "../interfaces/dietaryTag.interface";
import { DietaryTagRepository } from "../repositories/dietaryTag.repository";

export class DietaryTagService{
    private dietaryTagRepo = new DietaryTagRepository();

    //get all dietary tags
    async getDietaryTags(): Promise<IDietaryTag[]>{
        try{
            return await this.dietaryTagRepo.getDietaryTags();
        }
        catch(err){
            throw err;
        }
    }

    //create dietary tag
    async createDietaryTag(name: string): Promise<IDietaryTag>{
        try{
            //check if dietary tag already exist or not
            const isExist = await this.dietaryTagRepo.findDietaryTagByName(name);

            if(isExist){
                throw new Error("Dietary tag already exists");
            }

            return await this.dietaryTagRepo.createDietaryTag(name);
        }
        catch(err){
            throw err;
        }
    }

    //update dietary tag
    async updateDietaryTag(id: string, name: string){
        try{
            //check if dietary tag exists or not
            const isExist = await this.dietaryTagRepo.findDietaryTagById(id);

            if(!isExist){
                throw new Error("Dietary tag doesn't exists");
            }
            
            await this.dietaryTagRepo.updateDietaryTag(id, name);
        }
        catch(err){
            throw err;
        }
    }

    //delete dietary tag
    async deleteDietaryTag(id: string){
        try{
            //check if dietary tag exists or not
            const isExist = await this.dietaryTagRepo.findDietaryTagById(id);

            if(!isExist){
                throw new Error("Dietary tag doesn't exist");
            }

            await this.dietaryTagRepo.deleteDietaryTag(id);
        }
        catch(err){
            throw err;
        }
    }
}