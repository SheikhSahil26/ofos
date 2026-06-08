import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { DietaryTagController } from "../controllers/dietaryTag.controller";

export class DietaryTagsRoute implements IRoutes{
    path = "/dietary-tags";
    router = Router();
    controller = new DietaryTagController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.get("/", this.controller.getAllDietaryTags);
        this.router.post("/", this.controller.createDietaryTag);
        this.router.put("/:id", this.controller.updateDietaryTag);
        this.router.delete("/:id", this.controller.deleteDietaryTag);
    }
}