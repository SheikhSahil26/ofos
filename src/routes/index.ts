import { Router } from "express";
import type { IRoutes } from "../common/interfaces/route.interface.js";
import { AuthRoutes } from "../modules/auth/routes/auth.route.js";

export function buildApiRouter(): Router{
    const router = Router();

    const routes: IRoutes[] = [
     new AuthRoutes(),
    ]

    routes.forEach((route) => {
        router.use(route.path, route.router);
    });

    return router;
}