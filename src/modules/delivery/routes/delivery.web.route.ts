import { IRoutes } from "../../../common/interfaces/route.interface";
import { Request, Response, Router } from "express";
// import { UserController } from "../controllers/user.controller";

export class DeliveryWebRoutes implements IRoutes{
    path= "/"
    router= Router();
    // controller = new UserController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        
        this.router.get("/delivery", (req: Request, res: Response) => {
            res.status(200).render("delivery-partner/delivery-partner");
        });
        

        

    }
}