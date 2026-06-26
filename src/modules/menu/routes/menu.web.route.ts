import { IRoutes } from "../../../common/interfaces/route.interface";
import { Request, Response, Router } from "express";
import { MenuController } from "../controllers/menu.controller";

export class MenuWebRoutes implements IRoutes{
    path= "/menu"
    router= Router();
    controller = new MenuController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        
        this.router.get("/menu-management", (req: Request, res: Response) => {
            res.status(200).render("restaurant/menu-management", { activePage: "dashboard"});
        });
    }
}