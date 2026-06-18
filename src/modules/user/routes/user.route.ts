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
        this.router.get("/dashboard", this.controller.dashboardPage);
        this.router.get('/profilePage', isAuthenticated, this.controller.getProfilePage);
        this.router.get("/profile", isAuthenticated, this.controller.getProfile);
        this.router.patch("/profile", isAuthenticated, upload.single("profilePhoto"), this.controller.updateProfile);
        this.router.delete("/profile", isAuthenticated, this.controller.deleteUserAccount);
        this.router.delete("/profile/photo", isAuthenticated, this.controller.deleteProfilePhoto);
    }
}