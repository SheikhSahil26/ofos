import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { LoyaltyPointsController } from "../controllers/loyaltyPoints.controller";
import { initialize } from "passport";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware";

export class LoyaltyPointsRoutes implements IRoutes{
    path= "/loyalty";
    router= Router();
    controller = new LoyaltyPointsController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.get("/balance", isAuthenticated, this.controller.getBalance);
        this.router.get("/transactions", isAuthenticated, this.controller.getTransactions);
        this.router.post("/redeem-preview", isAuthenticated, this.controller.getDiscount); //it will calculate discount for an order
        //redeem-preview (it will calculate how many points user gets when he places an order)
    }
}