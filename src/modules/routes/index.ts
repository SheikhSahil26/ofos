import { Router } from "express";
import type { IRoutes } from "../../common/interfaces/route.interface.js";
import { UserRoutes } from "../user/routes/user.route.js";

export function buildApiRouter(): Router{
    const router = Router();

    const routes: IRoutes[] = [
        //create objects of all router classes here
        new UserRoutes(),
    ]

    routes.forEach((route) => {
        router.use(route.path, route.router);
    });

    return router;
}