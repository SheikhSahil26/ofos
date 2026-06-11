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
        this.router.get("/staff/:branchId", this.controller.getStaffByBranch);
        this.router.post("/staff/:branchId", this.controller.addStaff);
        this.router.delete("/staff/:branchId/:userId", this.controller.removeStaff);
    }
}