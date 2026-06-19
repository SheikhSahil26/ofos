import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";
import { AdminService } from "../services/admin.services";

export class AdminController {
    private adminService = new AdminService();

    //get user details
    getUserDetails = asyncHandler(async (req, res) => {
        const id = req.params.id;
        if (typeof id != 'string') {
            throw new AppError("ID is required", 400);
        }

        const response = await this.adminService.getUserDetails(id);

        res.status(response.statusCode || 200).json(response);
    });

    //customer details
    getCustomerDetails = asyncHandler(async (req, res) => {

        const id = req.params.id;
        if (typeof id != 'string') {
            throw new AppError("ID is required", 400);
        }

        const response = await this.adminService.getCustomerDetails(id);

        res.status(response.statusCode || 200).json(response);
    });

    //restaurant owner details
    getRestaurantOwnerDetails = asyncHandler(
        async (req, res) => {

            const id = req.params.id;
            if (typeof id != 'string') {
                throw new AppError("ID is required", 400);
            }

            const response = await this.adminService.getRestaurantOwnerDetails(id);

            res.status(response.statusCode || 200).json(response);
        });


    getAllBranchesDetails = asyncHandler(
        async (req, res) => {

            const page =
                Number(req.query.page) || 1;

            const limit =
                Number(req.query.limit) || 10;

            const search =
                req.query.search as string;

            const status =
                req.query.status as string;

            const openStatus =
                req.query.openStatus as string;

            const sort =
                req.query.sort as string;


            const data =
                await this.adminService
                    .getAllBranches(
                        page,
                        limit,
                        search,
                        status,
                        openStatus,
                        sort
                    );

            return res.status(200).json({
                ...data
            });

        }
    )

    getBranchesStats = asyncHandler(async (req, res) => {

        const data =
            await this.adminService.getBranchesStats();

        return res.status(200).json({
            ...data
        });

    }
    );

}