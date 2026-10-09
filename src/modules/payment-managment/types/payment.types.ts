export interface PaymentSuccessInput {
  paymentId: string;
}

export interface PaymentFailureInput {
  paymentId: string;
  reason: string;
}

export interface PaymentTransactionData {
  paymentId: string;
  transactionId: string;
  amount: number;
  status: string;
}