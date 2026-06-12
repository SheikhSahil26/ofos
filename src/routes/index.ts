import { Router } from "express";
import type { IRoutes } from "../common/interfaces/route.interface.js";
import { AuthRoutes } from "../modules/auth/routes/auth.route.js";
import { CartRoutes } from "../modules/cart/routes/cart.routes.js";
import { UserRoutes } from "../modules/user/routes/user.route.js";
import { RestaurantStaffRoutes } from "../modules/restaurantStaff/routes/restaurantStaff.route.js";
import { OrdersRoutes } from "../modules/orders/routes/orders.route.js";

export function buildApiRouter(): Router {
    const router = Router();

    const routes: IRoutes[] = [
        new AuthRoutes(),
        new CartRoutes(),
        new OrdersRoutes(),
        new UserRoutes(),
        new RestaurantStaffRoutes(),
    ]

    routes.forEach((route) => {
        router.use(route.path, route.router);
    });

    return router;
}