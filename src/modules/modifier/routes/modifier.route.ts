import { Router} from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { upload } from "../../../middlewares/multer.middleware";
import { ModifierController } from "../controllers/modifier.controller";

export class ModifierRoutes implements IRoutes{
    path = "/modifier";
    router = Router();
    controller = new ModifierController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() : void{
        this.router.post("/menu-items/:menuItemId/groups", this.controller.createModifierGroup); /* Create a new modifier group */
        this.router.get("/menu-items/:menuItemId/groups", this.controller.getModifierGroupsByMenuItemId); /* List all modifier groups for a menu item */
        this.router.put("/groups/:id", this.controller.updateModifierGroup); /* Update modifier group settings */
        this.router.delete("/groups/:id",this.controller.softDeleteModifierGroup); /* soft delete a modifier group */
        this.router.post("/groups/:groupId/options", this.controller.createModifierOption); /* Create a new modifier option */
        this.router.get("/groups/:groupId/options", this.controller.getModifierOptionsByGroupId);  /* List all modifier option for a modifier group */
        this.router.put("/options/:id", this.controller.updateModifierOption); /* Update modifier option */
        this.router.delete("/options/:id",this.controller.softDeleteModifierOption); /* soft delete a modifier option    */
    }
}