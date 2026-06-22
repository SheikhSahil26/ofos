import { IRoutes } from "../../../common/interfaces/route.interface";
import { Request, Response, Router } from "express";
import { AdminController } from "../controllers/admin.controller";

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

        this.router.get("/coupon", (req: Request, res: Response) => {
            res.status(200).render("admin/coupon");
        })


        this.router.get("/restaurant-approvals", (req: Request, res: Response) => {
            res.status(200).render("admin/restaurant-approvals", {

                currentPage: 1,

                totalPages: 5,

                approvals: [

                    {
                        id: 1,
                        name: "Pizza Palace",
                        owner: "Rahul Patel",
                        category: "Pizza",
                        city: "Ahmedabad",
                        submittedAt: "16 Jun 2026",
                        logo: "https://picsum.photos/60?1"
                    },

                    {
                        id: 2,
                        name: "Burger Hub",
                        owner: "Jay Shah",
                        category: "Burger",
                        city: "Surat",
                        submittedAt: "15 Jun 2026",
                        logo: "https://picsum.photos/60?2"
                    }

                ]

            });
        });

    }
}