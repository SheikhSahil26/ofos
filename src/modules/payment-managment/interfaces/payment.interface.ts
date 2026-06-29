export interface IPaymentResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  status: string;
}

export interface IPaymentTransactionResponse {
  transactionId: string;
  status: string;
}