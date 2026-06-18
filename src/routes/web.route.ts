import { Router } from "express"
import { IRoutes } from "../common/interfaces/route.interface";
import { WebAuthRoutes } from "../modules/auth/routes/auth.web.route";

export function buildWebRoutes(): Router {
    const router = Router();

    const routes: IRoutes[] = [
        //create frontend view routes here
        new WebAuthRoutes(),
    ];

    routes.forEach((route) => {
        router.use(route.path, route.router)
    });

    return router;
}
