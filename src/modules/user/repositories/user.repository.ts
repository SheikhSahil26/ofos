import { IExistUser, IUpdateUser, IUser } from "../interfaces/user.interface";
import {prisma} from "../../../config/prisma";

const userProfileSelect = {
    id: true,
    fullName: true,
    email: true,
    mobile: true,
    profilePhoto: true,
    isVerified: true,
    isActive: true,
    isDeleted: true,
    createdAt: true,
    updatedAt: true,
} as const;

export class UserRepository{

    //find user by id
    async findUserById(userId: string): Promise<IExistUser | null>{
        try{
            return await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    email: true,
                    isDeleted: true,
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
            return await prisma.user.findUnique({
                where: {
                    email: email
                },
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

    //checking user exist or not by id
    async validateUser(userId: string): Promise<boolean>{
        try{
            const user = await this.findUserById(userId);

            if(!user || user.isDeleted){
                throw new Error("User not found");
            }

            return true;
        }
        catch(err){
            throw err;
        }
    }

    //get profile of user
    async getProfile(userId: string) : Promise<IUser | null>{
        try{
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: userProfileSelect
            });

            if(!user || user.isDeleted){
                throw new Error("User not found");
            }

            return user;
        }
        catch(err){
            throw err;
        }
    }

    //update profile of user
    async updateProfile(userId: string, data: IUpdateUser) : Promise<IUser | null>{
        try{
            //update user
            const updatedUser = await prisma.user.update({
                where: {
                    id: userId,
                },
                data: data,
                select: userProfileSelect
            });

            return updatedUser;
        }
        catch(err){
            throw err;
        }
    }

    //delete profile of user
    async deleteProfile(userId: string) : Promise<void>{
        try{
            //delete user
            await prisma.user.update({
                where: {
                    id: userId
                }, 
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: new Date()
                }
            });

            console.log("user deleted successfully");
        }
        catch(err){
            throw err;
        } 
    }
}