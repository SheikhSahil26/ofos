import { Router } from "express"
import { IRoutes } from "../common/interfaces/route.interface";
import { AdminWebRoutes } from "../modules/admin/routes/admin.web.route";

export function buildWebRoutes(): Router{
    const router = Router();

    const routes: IRoutes[] = [
        //create frontend view routes here
        new AdminWebRoutes(),
    ];

    routes.forEach((route) => {
        router.use(route.path, route.router)
    });

    return router;
}