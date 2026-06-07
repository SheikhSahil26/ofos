import { IUpdateUser, IUser } from "../interfaces/user.interface";
import { UserRepository } from "../repositories/user.repository";

export class UserService{

    private userRepo = new UserRepository();

    //get profile of user
    async getProfile (userId: string): Promise<IUser | null>{
        try{
            return await this.userRepo.getProfile(userId);
        }
        catch(err){
            throw err;
        }
    }

    //update profile of user
    async updateProfile(userId: string, data: IUpdateUser): Promise<IUser | null> {
        try{
            //check if user exist or not
            await this.userRepo.validateUser(userId);

            return await this.userRepo.updateProfile(userId, data);
        }
        catch(err){
            throw err;
        }
    }

    //delete profile of user
    async deleteProfile(userId: string): Promise<void>{
        try{
            //check if user exist or not
            await this.userRepo.validateUser(userId);

            await this.userRepo.deleteProfile(userId);
        }
        catch(err){
            throw err;
        } 
    }
}