import { Router } from "express";
import type { IRoutes } from "../../common/interfaces/route.interface.js";
import { UserRoutes } from "../user/routes/user.route.js";
import { AuthRoutes } from "../auth/routes/auth.route.js";
import { MenuRoutes } from "../menu/routes/menu.route.js";
import { DietaryTagsRoute } from "../dietaryTags/routes/dietaryTag.route.js";
import { AddressRoute } from "../address/routes/address.route.js";
import { RestaurantRoutes } from "../restaurant/routes/restaurant.route.js";
import { BranchRoutes } from "../restaurant-branch/routes/branch.route.js";
import { OperatingHourRoutes } from "../operatingHours/route/operating-hour.route.js";
import "../../config/jwtAuth.js";

export function buildApiRouter(): Router{
    const router = Router();

    const routes: IRoutes[] = [
        //create objects of all router classes here
        new UserRoutes(),
        new AuthRoutes(),
        new MenuRoutes(),
        new DietaryTagsRoute(),
        new AddressRoute(),
        new RestaurantRoutes(),
        new BranchRoutes(),
        new OperatingHourRoutes()

    ]

    routes.forEach((route) => {
        router.use(route.path, route.router);
    });

    return router;
}