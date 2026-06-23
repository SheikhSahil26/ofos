import { IRoutes } from "../../../common/interfaces/route.interface";
import { Request, Response, Router } from "express";
import { BranchWebController } from "../../restaurantBranch/controllers/branch.web.controller";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware";

export class RestaurantWebRoutes implements IRoutes {
    path = "/restaurants"
    router = Router();
    branchWebController = new BranchWebController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.get("/dashboard", (req: Request, res: Response) => {
            res.render("restaurant/dashboard", { activePage: "dashboard" })
        });

        this.router.get("/create", (req: Request, res: Response) => {
            res.render("restaurant/home", { activePage: "branches" })
        });

        this.router.get("/home", (req: Request, res: Response) => {
            res.render("customer/home", { activePage: "home" });
        });

        this.router.get("/detail/:branchId", (req: Request, res: Response) => {
            res.render("restaurant/detailPage", {activePage: ""});
        });

        this.router.get("/branches", (req: Request, res: Response) => {
            res.render("restaurant/branches", { activePage: "branches" })
        });

        this.router.get("/branches/:branchId", this.branchWebController.renderBranchDetails);
    }
}