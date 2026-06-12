import { Router } from "express";
import { PayoutController } from "../controllers/payout.controller";
import { PayoutService } from "../services/payout.service";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { prisma } from "../../../config/prisma";



export class PaymentsRoutes implements IRoutes {
    path = "/payments";
    router = Router();
    payoutService = new PayoutService(prisma);
    controller = new PayoutController(this.payoutService);

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {

        this.router.post(
            "/process/:orderId",
        this.controller.processPayout
        );

        this.router.get(
            "/order/:orderId",
            this.controller.getPayoutByOrderId
        );

    }

}


//



