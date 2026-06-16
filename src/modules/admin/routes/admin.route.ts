import { Router} from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { AdminController } from "../controllers/admin.controller";

export class AdminRoutes implements IRoutes{
    path = "/admin";
    router = Router();
    controller = new AdminController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() : void{
        this.router.get("/users/:id",this.controller.getUserDetails); /* get general info of the user */
        this.router.get("/customers/:id",this.controller.getCustomerDetails); /* customer details */
        this.router.get("/restaurant-owners/:id",this.controller.getRestaurantOwnerDetails); /* restaurant owner details */
    }
}