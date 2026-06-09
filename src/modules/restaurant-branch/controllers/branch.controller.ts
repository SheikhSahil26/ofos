import { Request, Response } from "express";


export class BranchController {
    private branchService = new RestaurantBranchService();

    //get all branches of a restaurant
    getBranches = async (req: Request, res: Response) => {
        try {

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Error fetching branches",
            });
        }
    }
}
