import { IRoutes } from "../../../common/interfaces/route.interface";
import { Request, Response, Router } from "express";
// import { UserController } from "../controllers/user.controller";

export class RestaurantStaffWebRoutes implements IRoutes{
    path= "/"
    router= Router();
    // controller = new UserController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){

        this.router.get("/staff/order-queue", (req: Request, res: Response) => {
            res.status(200).render("restaurant-staff/order-queue", {activePage: "order-queue",role:"staff"})
        })
        
       
    }
}