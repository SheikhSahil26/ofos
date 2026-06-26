import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { AdminController } from "../controllers/admin.controller";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware";

export class AdminRoutes implements IRoutes {
    path = "/admin";
    router = Router();
    controller = new AdminController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get("/users/:id", this.controller.getUserDetails); /* get general info of the user */
        this.router.get("/customers/:id", this.controller.getCustomerDetails); /* customer details */
        this.router.get("/restaurant-owners/:id", this.controller.getRestaurantOwnerDetails); /* restaurant owner details */

        this.router.get("/branches", isAuthenticated, this.controller.getAllBranchesDetails); // Fetch all the approved branches
        this.router.get("/branches/stats", isAuthenticated, this.controller.getBranchesStats); // Fetch all the requested for approval branches
        this.router.patch("/users/:id/status", isAuthenticated, this.controller.updateUserStatus); // activate and deactivate a user

        this.router.get(
            "/restaurant-approvals",
            this.controller.getPendingRestaurantApprovals
        );

        this.router.get(
            "/restaurant-approvals/count",
            this.controller.getPendingRestaurantApprovalCount
        );

        this.router.patch(
            "/restaurant-approvals/:branchId/approve",
            this.controller.approveBranch
        );

        this.router.patch(
            "/restaurant-approvals/:branchId/reject",
            this.controller.rejectBranch
        );

    }
}