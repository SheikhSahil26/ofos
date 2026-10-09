import { IRoutes } from "../../../common/interfaces/route.interface";
import { Request, Response, Router } from "express";
import { UserController } from "../controllers/user.controller";

export class UserWebRoutes implements IRoutes{
    path= "/customer"
    router= Router();
    controller = new UserController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        
        this.router.get("/home", (req: Request, res: Response) => {
            res.status(200).render("customer/home", {activePage: "home"})
        });
        
        this.router.get("/profile", (req: Request, res: Response) => {
            res.status(200).render("customer/profile", {activePage: "profile"});
        });

        this.router.get("/dashboard", (req: Request, res: Response) => {
            res.status(200).render("customer/dashboard", {activePage: "dashboard"});
        });

        this.router.get("/addresses", (req: Request, res: Response) => {
            res.status(200).render("customer/addresses", {activePage: "addresses"});
        });

        this.router.get("/ziggy-points", (req: Request, res: Response) => {
            res.status(200).render("customer/loyalty-points", {activePage: "points"});
        });

        this.router.get("/orders", (req: Request, res: Response) => {
            res.status(200).render("customer/orders", {activePage: "orders"});
        });

        this.router.get("/reviews", (req: Request, res: Response) => {
            res.status(200).render("customer/reviews", {activePage: "reviews"});
        });
    }
}