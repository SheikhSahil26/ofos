import { PrismaClient } from "@prisma/client";
import { ServiceResponse } from "../../../common/types/service-response.types";
import { PaymentRepository } from "../repositories/payment.repository";

export class PaymentService {
  private paymentRepo: PaymentRepository;

  constructor(private prisma: PrismaClient) {
    this.paymentRepo = new PaymentRepository(prisma);
  }

  async getPaymentByOrderId(orderId: string): Promise<ServiceResponse<any>> {
    const payment =
      await this.paymentRepo.getPaymentByOrderId(orderId);

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: payment,
      message: "Payment fetched successfully",
      statusCode: 200,
    };
  }

  async processPaymentSuccess(
    paymentId: string
  ): Promise<ServiceResponse<any>> {

    const payment =
      await this.paymentRepo.getPaymentById(paymentId);

      console.log("Payment fetched in processPaymentSuccess:", payment);
      

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
        statusCode: 404,
      };
    }

    // console.log("Payment Status : ",payment.amount)
    if (payment.status !== "PENDING") {
      return {
        success: false,
        error: "Payment already processed",
        statusCode: 400,
      };
    }

    await this.paymentRepo.processPaymentSuccess(
      payment.id,
      payment.orderId,
      Number(payment.amount)
    );

    return {
      success: true,
      message: "Payment completed successfully",
      data: {
        orderId: payment.orderId
      },
      statusCode: 200,
    };
  }

  async processPaymentFailure(
    paymentId: string,
    reason: string
  ): Promise<ServiceResponse<any>> {

    const payment =
      await this.paymentRepo.getPaymentById(paymentId);

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
        statusCode: 404,
      };
    }

    if (payment.status !== "PENDING") {
      return {
        success: false,
        error: "Payment already processed",
        statusCode: 400,
      };
    }

    await this.paymentRepo.processPaymentFailure(
      payment.id,
      payment.orderId,
      Number(payment.amount),
      reason
    );

    return {
      success: true,
      message: "Payment marked as failed",
      statusCode: 200,
    };
  }
}