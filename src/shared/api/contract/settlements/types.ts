export interface Settlement {
  id: string;
  payerId: string;
  receiverId: string;
  amount: number;
  currency: string;
  status: "pending" | "paid";
  createdAt: string;
  payer: {
    id: string;
    name: string;
    image?: string;
  };
  receiver: {
    id: string;
    name: string;
    image?: string;
  };
}