export interface BillItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category: string | null
}

export interface BillDiscount {
  name: string
  amount: number
  type: string
}

export interface AdditionalFee {
  name: string
  amount: number
}

export interface ExtractedBillData {
  merchantName: string | null
  merchantAddress: string | null
  receiptNumber: string | null
  date: string | null
  time: string | null
  items: BillItem[]
  subtotal: number | null
  discounts: BillDiscount[]
  serviceCharge: number | null
  tax: number | null
  additionalFees: AdditionalFee[]
  totalAmount: number | null
  paymentMethod: string | null
  currency: string | null
  cashier: string | null
  tableNumber: string | null
}

export interface OCRResponse {
  success: boolean
  data?: ExtractedBillData
  error?: string
}