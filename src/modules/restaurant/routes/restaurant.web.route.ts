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

        this.router.get("/promotions", (req: Request, res: Response) => {
            res.render("restaurant/promotions", { activePage: "promotions" })
        });

        this.router.get("/branches/:branchId", this.branchWebController.renderBranchDetails);

        this.router.get("/menu/menu-management/:branchId", (req: Request, res: Response) => {
            res.status(200).render("restaurant/menu-management", { activePage: "branches", branchId: req.params.branchId});
        });

        this.router.get("/reviews", (req: Request, res: Response) => {
            res.status(200).render("restaurant/reviews", {activePage: "reviews"});
        })

        this.router.get("/orders/:orderId", (req: Request, res: Response) => {
            res.status(200).render("restaurant/order", {orderId: req.params.orderId, activePage: "reviews"})
        })
    }
}