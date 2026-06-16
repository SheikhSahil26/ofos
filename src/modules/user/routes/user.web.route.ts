import { IRoutes } from "../../../common/interfaces/route.interface";
import { Router } from "express";
import { UserController } from "../controllers/user.controller";

export class UserWebRoutes implements IRoutes{
    path= "/"
    router= Router();
    controller = new UserController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.get("/profile", this.controller.profilePage);
        this.router.get("/dashboard", this.controller.dashboardPage);
    }
}