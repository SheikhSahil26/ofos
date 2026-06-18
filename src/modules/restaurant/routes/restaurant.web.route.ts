import { IRoutes } from "../../../common/interfaces/route.interface";
import { Request, Response, Router } from "express";

export class RestaurantWebRoutes implements IRoutes {
    path = "/restaurants"
    router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.get("/create", (req: Request, res: Response) => {
            res.render("restaurant/home");
        });

        this.router.get("/home", (req: Request, res: Response) => {
            res.render("customer/home", { activePage: "home" });
        });

        this.router.get("/restaurants/detail/:branchId", (req: Request, res: Response) => {
            res.render("restaurant/detailPage");
        });
    }
}