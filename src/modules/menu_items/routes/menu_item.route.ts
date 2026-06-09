import { Router} from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { MenuItemController } from "../controllers/menu_item.controller";

export class MenuItemRoutes implements IRoutes{
    path = "/menu-items";
    router = Router();
    controller = new MenuItemController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() : void{
        this.router.get("/categories/:categoryId/items", this.controller.getMenuItemsByCategory);
        this.router.post("/categories/:categoryId/items", this.controller.createMenuItem); /* Create a new menu item */
    }
}