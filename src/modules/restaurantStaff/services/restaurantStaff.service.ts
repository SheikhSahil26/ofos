import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { AuthRepository } from "../../auth/repositories/auth.repository";
import { IBranchStaff } from "../interfaces/restaurantStaff.interface";
import { RestaurantStaffRepository } from "../repositories/restaurantStaff.repository";
import { hashPassword } from "../../../utils/bcrypt";
import { ICreateUserDto, ISignupDto } from "../../auth/interfaces/auth.interface";

export class RestaurantStaffService{
    
    private staffRepo = new RestaurantStaffRepository();
    private authRepo = new AuthRepository();

    //check if branch exists or not
    async validateBranch(branchId: string): Promise<boolean>{
        const branch = await this.staffRepo.getBranchById(branchId);

        if(!branch){
            throw new AppError("Branch not found", 404);
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
    async addStaff(branchId: string, data: ISignupDto): Promise<ServiceResponse<IBranchStaff>>{
        
        const role = "RESTAURANT_STAFF"

        //check if branch exist or not
        await this.validateBranch(branchId);

        //check if user exist or not
        const isExist = await this.authRepo.findUserByEmail(data.email);

        //user already exists
        if(isExist){
        
            //check if staff exist in particular branch or not
            const assigned = await this.staffRepo.findStaffAssignment(branchId, isExist.id);

            if(assigned){

                if(!assigned.isDeleted){
                    throw new AppError("Staff already exist in branch", 409);
                }

                await this.staffRepo.reactiveStaff(branchId, isExist.id);
            }
            else{

                await this.staffRepo.addStaff(branchId, isExist.id);
            }

            //add restaurant_staff role and userId to user role table
            const hasRole = isExist.userRoles.some(ur => ur.role.role === role);

            if(!hasRole){
                await this.authRepo.assignRole(isExist.id, role);
            }

            return {
                success: true,
                message: "User already exists. Added to branch staff successfully.",
                statusCode: 200
            }
        }

        //if user not exist
        const hashedPassword = await hashPassword(data.password);

        const userData: ICreateUserDto = {
            fullName: data.fullName,
            email: data.email,
            mobile: data.mobile,
            passwordHash: hashedPassword
        }

        //create user and add role into userRole table
        const user = await this.authRepo.createUser(userData, role);

        //add staff to restaurantStaff table
        const staff = await this.staffRepo.addStaff(branchId, user.id);

        //add restaurant_staff role and userId to user role table
        await this.authRepo.assignRole(staff.user.id, role);

        //mapping staff result to Interface IBranchStaff
        const result : IBranchStaff = {
            id: staff.user.id,
            fullName: staff.user.fullName,
            email: staff.user.email,
            mobile: staff.user.mobile 
        }

        return {
            success: true,
            data: result,
            message: "Staff member created and assigned successfully",
            statusCode: 201
        }
    }

    //remove staff
    async removeStaff(branchId: string, userId: string): Promise<ServiceResponse<null>>{
        
        //check if branch exist or not
        await this.validateBranch(branchId);

        //check if staff exist in particular branch or not
        const isExist = await this.staffRepo.findStaffAssignment(branchId, userId);

        if(!isExist || isExist.isDeleted){
            throw new AppError("Staff doesn't exist", 404);
        }

        await this.staffRepo.removeStaff(branchId, userId);

        return {
            success: true,
            message: "Staff removed successfully",
            statusCode: 200
        }
    }
}