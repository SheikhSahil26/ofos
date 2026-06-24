import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";
import { AdminService } from "../services/admin.services";
import { updateUserStatusSchema } from "../validations/admin.validation";

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


    //activate and deactivate a user
    updateUserStatus = asyncHandler(
        async (req, res) => {

            const { id } = req.params;
            if (typeof id != 'string') {
                throw new AppError("ID is required", 400);
            }

            const { error } = updateUserStatusSchema.validate(req.body);

            if (error) {
                throw new AppError(error.details[0]?.message || "Validation failed", 400);
            }

            const response = await this.adminService.updateUserStatus(id, req.body);

            res.status(response.statusCode || 200).json(response);
        }
    );
    getPendingRestaurantApprovals = asyncHandler(async (
        req,
        res
    ): Promise<void> => {

        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 10;

        const search =
            req.query.search as string;

        const result =
            await this.adminService
                .getPendingRestaurantApprovals(
                    page,
                    limit,
                    search
                );

        res.status(result.statusCode || 200)
            .json(result);
    });


    getPendingRestaurantApprovalCount = asyncHandler(async (
        req,
        res
    ): Promise<void> => {

        const result =
            await this.adminService
                .getPendingRestaurantApprovalCount();

        res.status(result.statusCode || 200)
            .json(result);
    });

    approveBranch = asyncHandler(async (
        req,
        res
    ): Promise<void> => {

        const { branchId } = req.params;

        if (!branchId || typeof branchId !== 'string') {
            throw new AppError("BranchId must be Required", 429);
        }

        const result =
            await this.adminService
                .approveBranch(branchId);

        res
            .status(result.statusCode || 200)
            .json(result);
    });

    rejectBranch = asyncHandler(async (
        req,
        res
    ): Promise<void> => {

        const { branchId } = req.params;

        if (!branchId || typeof branchId !== 'string') {
            throw new AppError("BranchId must be Required", 429);
        }

        const result =
            await this.adminService
                .rejectBranch(branchId);

        res
            .status(result.statusCode || 200)
            .json(result);
    });


    getPendingPartners = asyncHandler(
        async (req, res) => {

            const page =
                Number(req.query.page) || 1;

            const limit =
                Number(req.query.limit) || 10;

            const search =
                req.query.search as string;

            const result =
                await this.adminService.getPendingPartners(
                    page,
                    limit,
                    search
                );

            res
                .status(result.statusCode || 200)
                .json(result);
        }
    );

    getStats = asyncHandler(
        async (
            req,
            res
        ): Promise<void> => {

            const result =
                await this.adminService.getStats();

            res
                .status(result.statusCode || 200)
                .json(result);
        }
    );

    approvePartner = asyncHandler(
        async (
            req,
            res
        ): Promise<void> => {

            const { id } =
                req.params;

            if (
                !id ||
                typeof id !== "string"
            ) {

                throw new AppError(
                    "Partner id is required",
                    400
                );
            }

            const result =
                await this.adminService.approvePartner(
                    id
                );

            res.status(result.statusCode || 200).json(result);
        }
    );

    rejectPartner = asyncHandler(
        async (
            req,
            res
        ): Promise<void> => {

            const { id } =
                req.params;

            if (
                !id ||
                typeof id !== "string"
            ) {

                throw new AppError(
                    "Partner id is required",
                    400
                );
            }

            const result =
                await this.adminService.rejectPartner(
                    id
                );

            res
                .status(result.statusCode || 200)
                .json(result);
        }
    );

}