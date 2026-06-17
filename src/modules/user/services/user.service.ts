import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { IUpdateUser, IUser } from "../interfaces/user.interface";
import { UserRepository } from "../repositories/user.repository";

export class UserService{

    private userRepo = new UserRepository();

    //check if user exist or not
    async validateUser(userId: string): Promise<boolean>{

        const user = await this.userRepo.findUserById(userId);

        if(!user || user.isDeleted){
            throw new AppError("User not found", 404);
        }

        return true;
    }

    //get profile of user
    async getProfile (userId: string): Promise<ServiceResponse<IUser | null>>{
  
        //check if user exist or not 
        await this.validateUser(userId);

        const user = await this.userRepo.getProfile(userId);
        return {
            success: true,
            data: user,
            message: "User profile fetched successfully",
            statusCode: 200
        }
    }

    //update profile of user
    async updateProfile(userId: string, data: IUpdateUser): Promise<ServiceResponse<IUser | null>> {

        //check if user exist or not
        await this.validateUser(userId);

        const updatedUser = await this.userRepo.updateProfile(userId, data);

        return {
            success: true,
            data: updatedUser,
            message: "User updated successfully",
            statusCode: 200
        }
    }

    //delete profile photo of user
    async deletePofilePhoto(userId: string): Promise<ServiceResponse<IUser | null>>{

        //check if user exist or not
        await this.validateUser(userId);

        const deletedUser = await this.userRepo.deleteProfilePhoto(userId);

        return {
            success: true,
            data: deletedUser,
            message: "User profile deleted successfully",
            statusCode: 200
        }
    }

    //delete profile of user
    async deleteUserAccount(userId: string): Promise<ServiceResponse<null>>{

        //check if user exist or not
        await this.validateUser(userId);

        await this.userRepo.deleteUserAccount(userId);

        return {
            success: true,
            message: "Profile photo deleted successfully",
            statusCode: 200
        }
    }
}