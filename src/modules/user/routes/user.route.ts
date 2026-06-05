import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface.js";
import { UserController } from "../controllers/user.controller.js";

export class UserRoutes implements IRoutes{
    path = "/users";
    router = Router();
    controller = new UserController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() : void{
        this.router.get("/profile", this.controller.getProfile);
        this.router.patch("/profile", this.controller.updateProfile);
        this.router.delete("/account", this.controller.deleteUserAccount);
    }
}