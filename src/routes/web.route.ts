import { Router } from "express"
import { IRoutes } from "../common/interfaces/route.interface";
import { UserWebRoutes } from "../modules/user/routes/user.web.route";

export function buildWebRoutes(): Router{
    const router = Router();

    const routes: IRoutes[] = [
        //create frontend view routes here
        new UserWebRoutes(),
    ];

    routes.forEach((route) => {
        router.use(route.path, route.router)
    });

    return router;
}