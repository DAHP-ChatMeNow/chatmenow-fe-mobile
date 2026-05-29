export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  orderInfo?: string;
  sepayTransactionId?: string;
  status: string;
  createdAt: Date;
}
