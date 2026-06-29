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


        // Show and filter Approved Branches....
        this.router.get("/branches", isAuthenticated, this.controller.getAllBranchesDetails); // Fetch all the approved branches
        this.router.get("/branches/stats", isAuthenticated, this.controller.getBranchesStats); // Fetch all the requested for approval branches
        this.router.patch("/users/:id/status", isAuthenticated, this.controller.updateUserStatus); // activate and deactivate a user

        // Handle pending Approvals requests....
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


        // Handle delivery-partner-approvals...

        this.router.get(
            "/delivery-partners-approvals/pending",
            this.controller.getPendingPartners
        );

        this.router.get(
            "/delivery-partners-approvals/stats",
            this.controller.getStats
        );


        // Design inside the module of delivery
        // this.router.get(
        //     "/delivery-partners-approvals/:id",
        //     this.controller.getPartnerById
        // );

        this.router.patch(
            "/delivery-partners-approvals/:id/approve",
            this.controller.approvePartner
        );

        this.router.patch(
            "/delivery-partners-approvals/:id/reject",
            this.controller.rejectPartner
        );



        // Deliveries partners....

        this.router.get(
            "/delivery-partners",
            this.controller.getDeliveryPartners
        );

        this.router.get(
            "/delivery-partners/stats",
            this.controller.getDeliveryPartnerStats
        );



        // Restaurant Pending List
        this.router.get(
            "/payouts/restaurants",
            this.controller.getRestaurantPendingPayouts
        );

        // Delivery Pending List
        this.router.get(
            "/payouts/delivery-partners",
            this.controller.getDeliveryPartnerPendingPayouts
        );
    }
}