import { MenuController } from "../controllers/menu.controller";
import { Router} from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";

export class MenuRoutes implements IRoutes{
    path = "/menu";
    router = Router();
    controller = new MenuController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() : void{
        this.router.post("/branches/:branchId/categories", this.controller.createCategory); /* Create a new category */ 
        this.router.get("/branches/:branchId/categories", this.controller.getCategories); /* List all categories for a branch */
        this.router.get("/categories/:id", this.controller.getCategoryById); /* Get category details */
        this.router.put("/categories/:id", this.controller.updateCategory); /* Update category name or display order */
        this.router.delete("/categories/:id", this.controller.deleteCategory); /* Soft delete a category */
        this.router.patch("/categories/reorder",this.controller.reorderCategories); /* Reorder categories (bulk update display_order) */
    }
}