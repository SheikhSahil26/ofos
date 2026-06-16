import { IRoutes } from "../../../common/interfaces/route.interface";
import { Request, Response, Router } from "express";
import { AdminController } from "../controllers/admin.controller";

export class AdminWebRoutes implements IRoutes{
    path= "/admin"
    router= Router();
    controller = new AdminController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        
        this.router.get("/dashboard", (req: Request, res: Response) => {
            res.status(200).render("customer/dashboard");
        });
    }
}