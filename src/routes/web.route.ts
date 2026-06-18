import { Router } from "express"
import { IRoutes } from "../common/interfaces/route.interface";
import { WebAuthRoutes } from "../modules/auth/routes/auth.web.route";
import { AdminWebRoutes } from "../modules/admin/routes/admin.web.route";
import { MenuWebRoutes } from "../modules/menu/routes/menu.web.route";

export function buildWebRoutes(): Router {
    const router = Router();

    const routes: IRoutes[] = [
        //create frontend view routes here
        new WebAuthRoutes(),
        new AdminWebRoutes(),
        new MenuWebRoutes(),
    ];

    routes.forEach((route) => {
        router.use(route.path, route.router)
    });

    return router;
}
