import { Router } from "express";
import type { IRoutes } from "../common/interfaces/route.interface.js";

export function buildApiRouter(): Router{
    const router = Router();

    const routes: IRoutes[] = [
        //create objects of all router classes here
    ]

    routes.forEach((route) => {
        router.use(route.path, route.router);
    });

    return router;
}