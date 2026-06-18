import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";
import { AdminService } from "../services/admin.services";
import { updateUserStatusSchema } from "../validations/admin.validation";

export class AdminController{
    private adminService = new AdminService();

    //get user details
    getUserDetails = asyncHandler(async (req, res) => {
        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("ID is required", 400);
        }

        const response = await this.adminService.getUserDetails(id);

        res.status(response.statusCode || 200).json(response);
    });

    //customer details
    getCustomerDetails = asyncHandler(async (req, res) => {

        const id= req.params.id;
        if(typeof id != 'string'){
            throw new AppError("ID is required", 400);
        }

        const response = await this.adminService.getCustomerDetails(id);

        res.status(response.statusCode || 200).json(response);
    });

    //restaurant owner details
    getRestaurantOwnerDetails = asyncHandler(
    async (req, res) => {

        const id  = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("ID is required", 400);
        }

        const response = await this.adminService.getRestaurantOwnerDetails(id);

        res.status(response.statusCode || 200).json(response);
    });

    //activate and deactivate a user
    updateUserStatus = asyncHandler(
        async (req, res) => {

            const { id } = req.params;
            if(typeof id != 'string'){
                throw new AppError("ID is required", 400);
            }

            const { error } = updateUserStatusSchema.validate(req.body);

             if (error) {
                throw new AppError(error.details[0]?.message || "Validation failed", 400);
            }

            const response = await this.adminService.updateUserStatus(id,req.body);

            res.status(response.statusCode || 200).json(response);
        }
    );
}