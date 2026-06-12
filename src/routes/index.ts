import { Router } from "express";
import type { IRoutes } from "../common/interfaces/route.interface.js";
import { AuthRoutes } from "../modules/auth/routes/auth.route.js";
import { CartRoutes } from "../modules/cart/routes/cart.routes.js";
import { RestaurantRoutes } from "../modules/restaurant/routes/restaurant.route.js"

export function buildApiRouter(): Router{
    const router = Router();
    
    const routes: IRoutes[] = [
     new AuthRoutes(),
     new CartRoutes(),
     new RestaurantRoutes()
     
    ]

    routes.forEach((route) => {
        router.use(route.path, route.router);
    });

    return router;
}