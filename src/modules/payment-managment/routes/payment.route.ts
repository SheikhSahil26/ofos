import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { PaymentController } from "../controllers/payment.controller";
import { PaymentService } from "../services/payment.service";
import { prisma } from "../../../config/prisma";

export class PaymentsRoutes implements IRoutes {
  path = "/payments";
  router = Router();
  paymentService = new PaymentService(prisma);
  controller = new PaymentController(this.paymentService);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {

    this.router.get(
      "/order/:orderId",
      this.controller.getPaymentByOrderId
    );

    this.router.post(
      "/success",
      this.controller.paymentSuccess
    );

    this.router.post(
      "/failure",
      this.controller.paymentFailure
    );
  }
}


//



