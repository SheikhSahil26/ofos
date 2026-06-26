import { IRoutes } from "../../../common/interfaces/route.interface";
import { Request, Response, Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware";

export class AdminWebRoutes implements IRoutes {
    path = "/admin"
    router = Router();
    controller = new AdminController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.get("/dashboard", (req: Request, res: Response) => {
            res.status(200).render("admin/dashboard");
        });
        this.router.get("/customers", (req: Request, res: Response) => {
            res.status(200).render("admin/customers", {
                currentPage: 1,

                totalPages: 5,

            });
        });
        this.router.get("/restaurants", (req: Request, res: Response) => {
            res.status(200).render("admin/restaurants");
        });


        this.router.get("/restaurant-approvals", (req: Request, res: Response) => {
            res.status(200).render("admin/restaurant-approvals");
        });


        this.router.get("/deliveries-partners", (req: Request, res: Response) => {
            res.status(200).render("admin/delivery-partners");
        });

        this.router.get("/delivery-partners-approvals", (req: Request, res: Response) => {
            res.status(200).render("admin/delivery-partners-approvals");
        });

        this.router.get("/payouts", (req: Request, res: Response) => {
            res.status(200).render("admin/payout-dashboard");
        });


    }
}