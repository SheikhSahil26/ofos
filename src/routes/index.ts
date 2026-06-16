import { Router } from "express";
import type { IRoutes } from "../common/interfaces/route.interface.js";
import { AuthRoutes } from "../modules/auth/routes/auth.route.js";

import { UserRoutes } from "../modules/user/routes/user.route.js";
import { AddressRoutes } from "../modules/address/routes/address.route.js";

import { RestaurantStaffRoutes } from "../modules/restaurantStaff/routes/restaurantStaff.route.js";

import { DeliveryRoutes } from "../modules/delivery/routes/delivery.route.js";
import { BranchRoutes } from "../modules/restaurantBranch/routes/branch.route.js";
import { DietaryTagsRoutes } from "../modules/dietaryTags/routes/dietaryTag.route.js";
import { OperatingHourRoutes } from "../modules/operatingHours/route/operating-hour.route.js";
import { MenuRoutes } from "../modules/menu/routes/menu.route.js";
import { MenuItemRoutes } from "../modules/menu_items/routes/menu_item.route.js";
import { ModifierRoutes } from "../modules/modifier/routes/modifier.route.js";
import { CouponRoutes } from "../modules/coupons/routes/coupon.route.js";


export function buildApiRouter(): Router {
    const router = Router();

    const routes: IRoutes[] = [
        new AuthRoutes(),
        new UserRoutes(),
        new AddressRoutes(),
        new BranchRoutes(),
        new RestaurantStaffRoutes(),
        new DeliveryRoutes(),
        new BranchRoutes(),
        new DietaryTagsRoutes(),
        new OperatingHourRoutes(),
        new MenuRoutes(),
        new MenuItemRoutes(),
        new ModifierRoutes(),
        new CouponRoutes(),
    ]

    routes.forEach((route) => {
        router.use(route.path, route.router);
    });

    return router;
}