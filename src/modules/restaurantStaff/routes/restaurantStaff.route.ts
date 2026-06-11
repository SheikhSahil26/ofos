import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { RestaurantStaffController } from "../controllers/restaurantStaff.controller";

export class RestaurantStaffRoutes implements IRoutes{
    path = "/staff";
    router = Router();
    controller = new RestaurantStaffController();

    constructor(){   
        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.get("/:branchId", this.controller.getStaffByBranch);
        this.router.post("/:branchId", this.controller.addStaff);
        this.router.delete("/:branchId/:userId", this.controller.removeStaff);
    }
}