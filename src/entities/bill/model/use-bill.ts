import {
  createBill,
  CreateBillRequest,
  CreateBillResponse,
} from "@/shared/api/contract/bills";
import { useMutation } from "@tanstack/react-query";

export const useCreateBill = () => {
  return useMutation<CreateBillResponse, Error, CreateBillRequest>({
    mutationFn: (data: CreateBillRequest) => createBill(data),
    retry: false,
  });
};
