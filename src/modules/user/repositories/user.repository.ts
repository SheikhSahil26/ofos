import { IExistUser, IUpdateUser, IUser } from "../interfaces/user.interface";
import {prisma} from "../../../config/prisma";
import { AppError } from "../../../utils/appError";

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

    //find user by email
    async findUserByEmail(email: string): Promise<IExistUser | null>{

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

    //get profile of user
    async getProfile(userId: string) : Promise<IUser | null>{

        return await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: userProfileSelect
        });
    }

    //update profile of user
    async updateProfile(userId: string, data: IUpdateUser) : Promise<IUser | null>{

        //update user
        return await prisma.user.update({
            where: {
                id: userId,
            },
            data: data,
            select: userProfileSelect
        });
    }

    //delete profile photo of user
    async deleteProfilePhoto(userId: string): Promise<IUser | null>{

        return await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                profilePhoto: null,
            },
            select: userProfileSelect,
        })
    }

    //delete profile of user
    async deleteUserAccount(userId: string) : Promise<void>{

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
}