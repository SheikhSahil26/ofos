import { Router } from "express";
import type { IRoutes } from "../../common/interfaces/route.interface.js";
import { UserRoutes } from "../user/routes/user.route.js";
import { AuthRoutes } from "../auth/routes/auth.route.js";
import { DietaryTagsRoute } from "../dietaryTags/routes/dietaryTag.route.js";
import { AddressRoute } from "../address/routes/address.route.js";

export function buildApiRouter(): Router{
    const router = Router();

    const routes: IRoutes[] = [
        //create objects of all router classes here
        new UserRoutes(),
        new AuthRoutes(),
        new DietaryTagsRoute(),
        new AddressRoute(),
    ]

    routes.forEach((route) => {
        router.use(route.path, route.router);
    });

    return router;
}