import { UserRepository } from "../repositories/user.repository";

export class UserServices{

    private userRepo = new UserRepository();

    //get profile of user
    async getProfile (id: string): Promise<void>{
        try{
            const userId = id;
            console.log("user profile");
        }
        catch(err){
            throw err;
        }
    }

    //update profile of user
    updateProfile = async(id: string, data: any) => {
        try{
            const user = await this.userRepo.updateProfile(id, data);
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