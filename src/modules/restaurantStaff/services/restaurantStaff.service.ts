import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { UserRepository } from "../../user/repositories/user.repository";
import { IBranchStaff } from "../interfaces/restaurantStaff.interface";
import { RestaurantStaffRepository } from "../repositories/restaurantStaff.repository";

export class RestaurantStaffService{
    
    private staffRepo = new RestaurantStaffRepository();
    private userRepo = new UserRepository();
    // private authRepo = new AuthRepository();

    //check if branch exists or not
    async validateBranch(branchId: string): Promise<boolean>{
        const branch = await this.staffRepo.getBranchById(branchId);

        if(!branch){
            throw new AppError("Branch not found");
        }

        return true;
    }

    //check if staff alread assigned to particular branch or not
    async validateStaff(branchId: string, userId: string): Promise<boolean>{
        const staff = await this.staffRepo.findStaffAssignment(userId, branchId);

        if(staff){
            throw new AppError("Staff alread exist in branch");
        }

        return true;
    }

    //get all staff by branch
    async getStaffByBranch(branchId: string): Promise<ServiceResponse<IBranchStaff[]>>{

        await this.validateBranch(branchId);
        
        const staff = await this.staffRepo.getStaffByBranch(branchId);

        //map result of repo to interface
        const result: IBranchStaff[] = staff.map(item => ({
            id: item.user.id,
            fullName: item.user.fullName,
            email: item.user.email,
            mobile: item.user.mobile,
        }));

        return {
            success: true,
            data: result,
            message: "Staff for particular branch fetched successfully",
            statusCode: 200
        }
    }

    //add staff
    async addStaff(branchId: string, data: IBranchStaff): Promise<ServiceResponse<null>>{

        //check if user exist or not
        const user = await this.userRepo.findUserByEmail(data.email);

        //user already exists
        if(user){
            //check if branch exist or not
            await this.validateBranch(branchId);
        
            //check if staff exist in particular branch or not
            await this.validateStaff(data.id, branchId);

            await this.staffRepo.addStaff(branchId, data.id);

            return {
                success: true,
                message: "User already exists. Added to branch staff successfully.",
                statusCode: 200
            }
        }

        //user not exist


        return {
            success: true,
            message: "Staff member created and assigned successfully",
            statusCode: 201
        }
    }

    //remove staff
    async removeStaff(branchId: string, userId: string): Promise<ServiceResponse<null>>{
        
        //check if branch exist or not
        await this.validateBranch(branchId);

        //check if staff exist in particular branch or not
        await this.validateStaff(userId, branchId);

        await this.staffRepo.removeStaff(branchId, userId);

        return {
            success: true,
            message: "Staff removed successfully",
            statusCode: 200
        }
    }
}