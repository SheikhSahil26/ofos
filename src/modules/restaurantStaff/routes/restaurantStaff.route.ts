import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { RestaurantStaffController } from "../controllers/restaurantStaff.controller";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware";

export class RestaurantStaffRoutes implements IRoutes{
    path = "/staff";
    router = Router();
    controller = new RestaurantStaffController();

    constructor(){   
        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.get("/:branchId",  isAuthenticated,this.controller.getStaffByBranch);
        this.router.post("/:branchId", isAuthenticated, this.controller.addStaff);
        this.router.delete("/:branchId/:userId", isAuthenticated, this.controller.removeStaff);
    }
}