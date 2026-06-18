import { IRoutes } from "../../../common/interfaces/route.interface";
import { Request, Response, Router } from "express";
// import { UserController } from "../controllers/user.controller";

export class CartWebRoutes implements IRoutes{
    path= "/"
    router= Router();
    // controller = new UserController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        
        this.router.get("/see-cart", (req: Request, res: Response) => {
            res.status(200).render("cart/see-cart");
        });

        this.router.get("/dashboard", (req: Request, res: Response) => {
            res.status(200).render("customer/dashboard");
        });
    }
}