import { Router} from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { upload } from "../../../middlewares/multer.middleware";
import { ReviewController } from "../controllers/review.controller";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware";

export class ReviewRoutes implements IRoutes{
    path = "/review";
    router = Router();
    controller = new ReviewController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() : void{
        this.router.post("/",isAuthenticated, this.controller.createReview);
        this.router.get("/", isAuthenticated, this.controller.getReviews); //get all the reviews of a branch
        
    }
}
