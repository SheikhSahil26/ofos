import { IExistUser } from "../interfaces/user.interface";
import {prisma} from "../../../config/prisma";

export class UserRepository{

    //find user by id
    async findUserById(userId: string): Promise<IExistUser | null>{
        try{
            return await prisma.users.findUnique({
                where: {
                    id: userId
                }
                select: {
                    id: true,
                    email: true,
                    isDeleted: true
                }
            });
        }
        catch(err){
            throw err;
        }
    }

    //find user by email
    async findUserByEmail(email: string): Promise<IExistUser | null>{
        try{
            return await prisma.users.findUnique({
                where: {
                    email: email
                }
            })
        }
        catch(err){
            throw err;
        }
    }

    //get profile of user
    getProfile = async(id: string) => {
        try{

        }
        catch(err){
            throw err;
        }
    }

    //update profile of user
    updateProfile = async(id: string, data: any) => {
        try{
            // Implementation for updating user profile
            const user = await this.findUserById(id);

            if(!user){
                throw new Error("User not found");
            }
        }
        catch(err){
            throw err;
        }
    }

    //delete profile of user
    deleteProfile = async(id: string) => {
        try{

        }
        catch(err){
            throw err;
        } 
    }
}