import { IRoutes } from "../../../common/interfaces/route.interface";
import { Request, Response, Router } from "express";
// import { UserController } from "../controllers/user.controller";

export class OrderWebRoutes implements IRoutes{
    path= "/"
    router= Router();
    // controller = new UserController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        
       this.router.get("/track-order/:orderId", (req: Request, res: Response) => {
            const orderId = req.params.orderId as string;
            res.status(200).render("orders/track-order", { orderId });
        });

        this.router.get("/owner/orders", (req: Request, res: Response) => {
            res.status(200).render("restaurant/orders", { activePage: "orders" });
        });
    }
}