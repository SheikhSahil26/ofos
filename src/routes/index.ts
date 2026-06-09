import { Router } from "express";
import type { IRoutes } from "../common/interfaces/route.interface.js";
import { AuthRoutes } from "../modules/auth/routes/auth.route.js";
import { CartRoutes } from "../modules/cart/routes/cart.routes.js";
import { MenuRoutes } from "../modules/menu/routes/menu.route.js";
import { MenuItemRoutes } from "../modules/menu_items/routes/menu_item.route.js";

export function buildApiRouter(): Router{
    const router = Router();
    
    const routes: IRoutes[] = [
     new AuthRoutes(),
     new CartRoutes(),
     new MenuRoutes(),
     new MenuItemRoutes()
    ]

    routes.forEach((route) => {
        router.use(route.path, route.router);
    });

    return router;
}