import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { UserController } from "../controllers/user.controller";
import { upload } from "../../../middlewares/multer.middleware";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware";
import { authorizeRoles } from "../../../middlewares/roleMiddlware";

export class UserRoutes implements IRoutes{
    path = "/users";
    router = Router();
    controller = new UserController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() : void{
        this.router.get("/profile", isAuthenticated,authorizeRoles('CUSTOMER'),this.controller.getProfile);
        this.router.patch("/profile", upload.single("profilePhoto"), this.controller.updateProfile);
        this.router.delete("/profile", this.controller.deleteUserAccount);
        this.router.delete("/profile/photo", this.controller.deleteProfilePhoto);
    }
}