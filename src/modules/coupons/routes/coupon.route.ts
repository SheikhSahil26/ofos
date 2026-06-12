import { Router} from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { upload } from "../../../middlewares/multer.middleware";
import { CouponController } from "../controllers/coupon.controller";

export class CouponRoutes implements IRoutes{
    path = "/coupons";
    router = Router();
    controller = new CouponController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() : void{
        this.router.get("/", this.controller.getActiveCoupons); /* Get all active coupons (user) */
        this.router.post("/",this.controller.createCoupon); /* Create a new coupon (admin) */
        this.router.post("/validate", this.controller.validateCoupon); /* validate coupon */
        this.router.get("/:id", this.controller.getCouponById); /* get coupon by id */
        this.router.put("/:id",this.controller.updateCoupon); /* Update coupon details (admin) */
        this.router.patch("/:id/status",this.controller.updateCouponStatus); /* Active deactive coupon (admin) */
        this.router.delete("/:id", this.controller.deleteCoupon); /* soft delete coupon (admin) */
    }
}