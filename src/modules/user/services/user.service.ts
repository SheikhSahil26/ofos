export class UserServices{

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
    updateProfile = async(id: string) => {
        try{

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