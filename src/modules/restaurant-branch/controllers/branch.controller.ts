import { Request, Response } from "express";
import { BranchService } from "../services/branch.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { ICreateRestaurantBranch } from "../interfaces/branch.interface";


export class BranchController {
    private branchService = new BranchService();

   //Create new branch for restaurant
   createBranch = asyncHandler(
    async(
        req:Request,
        res:Response
    ) => {

        const restaurantIdParam = req.params.restaurantId;
        const restaurantId = Array.isArray(restaurantIdParam)
            ? restaurantIdParam[0]
            : restaurantIdParam;

        if (!restaurantId) {
            throw new Error("restaurantId is required");
        }

        const userId =
        req.user!.userId;

        const payload =
        req.body as ICreateRestaurantBranch;

        const data =
        await this.branchService
        .createBranch(
            restaurantId,
            userId,
            payload
        );

        return res.status(
            data.statusCode ?? 200
        ).json({
            ...data
        });

    }
);


getBranches = asyncHandler(
    async(
        req:Request,
        res:Response
    ) => {

        const restaurantIdParam = req.params.restaurantId;
        const restaurantId = Array.isArray(restaurantIdParam)
            ? restaurantIdParam[0]
            : restaurantIdParam;

        if (!restaurantId) {
            throw new Error("restaurantId is required");
        }

        const userId =
        req.user!.userId;

        const page =
        Number(req.query.page) || 1;

        const limit =
        Number(req.query.limit) || 10;

        const search =
        req.query.search as string;

        const data =
        await this.branchService
        .getBranches(
            restaurantId,
            userId,
            page,
            limit,
            search
        );

        return res.status(
            data.statusCode ?? 200
        ).json({
            ...data
        });

    }
);
}
