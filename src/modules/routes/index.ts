import { Router } from "express";
import type { IRoutes } from "../../common/interfaces/route.interface.js";
import { UserRoutes } from "../user/routes/user.route.js";
import { AuthRoutes } from "../auth/routes/auth.route.js";

export function buildApiRouter(): Router{
    const router = Router();

    const routes: IRoutes[] = [
        //create objects of all router classes here
        new UserRoutes(),
        new AuthRoutes()
    ]

    routes.forEach((route) => {
        router.use(route.path, route.router);
    });

    return router;
}