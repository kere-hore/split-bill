import { api } from "@/shared/api/axios";
import { CreateBillRequest, CreateBillResponse } from './types'

export async function createBill(data: CreateBillRequest): Promise<CreateBillResponse> {
  const response = await api.post('/bills', data)
  return response.data
}