import { Router } from "express"
import { IRoutes } from "../common/interfaces/route.interface";
import { UserWebRoutes } from "../modules/user/routes/user.web.route";
import { RestaurantWebRoutes } from "../modules/restaurant/routes/restaurant.web.route";
import { AdminWebRoutes } from "../modules/admin/routes/admin.web.route";
import { MenuWebRoutes } from "../modules/menu/routes/menu.web.route";
import { CartWebRoutes } from "../modules/cart/routes/cart.web.route";
import { OrderWebRoutes } from "../modules/orders/routes/orders.web.routes";
import { WebAuthRoutes } from "../modules/auth/routes/auth.web.route";

export function buildWebRoutes(): Router {
    const router = Router();

    const routes: IRoutes[] = [
        //create frontend view routes here
        new UserWebRoutes(),
        new RestaurantWebRoutes(),
        new AdminWebRoutes(),
        new MenuWebRoutes(),
        new CartWebRoutes(),
        new OrderWebRoutes(),
        new WebAuthRoutes()
    ];

    routes.forEach((route) => {
        router.use(route.path, route.router)
    });

    return router;
}