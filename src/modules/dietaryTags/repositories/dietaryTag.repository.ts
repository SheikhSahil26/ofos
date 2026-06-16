import { prisma } from "../../../config/prisma";
import { IDietaryTag } from "../interfaces/dietaryTag.interface";

export class DietaryTagRepository{

    //search dietary tag by id
    async findDietaryTagById(id: string): Promise<IDietaryTag | null>{
        try{
            return await prisma.dietaryTag.findUnique({
                where: {
                    id
                }
            });
        }
        catch(err){
            throw err;
        }
    }

    //search dietary tag by name
    async findDietaryTagByName(name: string): Promise<IDietaryTag | null>{
        try{
            return await prisma.dietaryTag.findFirst({
                where: {
                    name,
                }
            });
        }
        catch(err){
            throw err;
        }
    }

    //get all dietary tags
    async getDietaryTags(): Promise<IDietaryTag[]>{
        try{
            return await prisma.dietaryTag.findMany({
                orderBy: {
                    name: "asc",
                }
            });
        }
        catch(err){
            throw err;
        }
    }

    //create dietary tag
    async createDietaryTag(name: string): Promise<IDietaryTag>{
        try{
            return await prisma.dietaryTag.create({
                data: {
                    name,
                }
            });
        }
        catch(err){
            throw err;
        }
    }

    //update dietary tag
    async updateDietaryTag(id: string, name: string): Promise<IDietaryTag>{
        try{
            return await prisma.dietaryTag.update({
                where: {
                    id,
                }, 
                data: {
                    name
                }
            });
        }
        catch(err){
            throw err;
        }
    }

    //delete dieatary tag
    async deleteDietaryTag(id: string): Promise<void>{
        try{
            await prisma.dietaryTag.delete({
                where: {
                    id,
                }
            });
            console.log("Dietary tag deleted successfully");
        }
        catch(err){
            throw err;
        }
    }

    //to get the diatary tags of corresponding ids
    async getDietaryTagsByIds(tagIds: string[]) {
        return prisma.dietaryTag.findMany({
            where: {
            id: {
                in: tagIds,
            },
            },
        });
    }
}