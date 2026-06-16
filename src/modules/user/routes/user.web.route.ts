import { IRoutes } from "../../../common/interfaces/route.interface";
import { Request, Response, Router } from "express";
import { UserController } from "../controllers/user.controller";

export class UserWebRoutes implements IRoutes{
    path= "/"
    router= Router();
    controller = new UserController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        
        this.router.get("/profile", (req: Request, res: Response) => {
            res.status(200).render("customer/profile");
        });

        this.router.get("/dashboard", (req: Request, res: Response) => {
            res.status(200).render("customer/dashboard");
        });
    }
}