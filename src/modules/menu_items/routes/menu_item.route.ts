import { Router} from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { MenuItemController } from "../controllers/menu_item.controller";
import { upload } from "../../../middlewares/multer.middleware";

export class MenuItemRoutes implements IRoutes{
    path = "/menu-items";
    router = Router();
    controller = new MenuItemController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() : void{
        this.router.get("/categories/:categoryId/items", this.controller.getMenuItemsByCategory);
        this.router.post("/categories/:categoryId/items", upload.single("image"), this.controller.createMenuItem); /* Create a new menu item */
        this.router.get("/search", this.controller.searchMenuItems); /*  Search menu items by name across branches */
        this.router.get("/:id",this.controller.getMenuItemById); /* Get menu item details with modifiers and tags */
        this.router.put("/:id", this.controller.updateMenuItem); /* Update menu item details */
        this.router.patch("/:id/image",upload.single("image"), this.controller.updateMenuItemImage);
        this.router.patch("/:id/availability", this.controller.updateAvailability); /* Toggle item availability */
        this.router.patch("/:id/bestseller", this.controller.updateBestseller); /* Toggle bestseller flag */
        this.router.delete("/:id", this.controller.deleteMenuItem); /* Soft delete a menu item */
        this.router.post("/:id/tags", this.controller.addDietaryTags); /*  Add dietary tags to a menu item */
        this.router.delete("/:id/tags/:tagId", this.controller.removeDietaryTag); /*  Remove dietary tags to a menu item */

        
    }
}