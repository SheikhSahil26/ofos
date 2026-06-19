import { Router } from "express"
import { IRoutes } from "../common/interfaces/route.interface";
import { WebAuthRoutes } from "../modules/auth/routes/auth.web.route";
import { CartWebRoutes } from "../modules/cart/routes/cart.web.route";
import { OrderWebRoutes } from "../modules/orders/routes/orders.web.routes";

export function buildWebRoutes(): Router {
    const router = Router();

    const routes: IRoutes[] = [
        //create frontend view routes here
        new WebAuthRoutes(),
        new CartWebRoutes(),
        new OrderWebRoutes()
    ];

    routes.forEach((route) => {
        router.use(route.path, route.router)
    });

    return router;
}
