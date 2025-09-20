export interface BillItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category?: string
}

export interface BillDiscount {
  name: string
  amount: number
  type: 'percentage' | 'fixed'
}

export interface AdditionalFee {
  name: string
  amount: number
}

export interface ExtractedBillData {
  merchantName?: string
  merchantAddress?: string
  receiptNumber?: string
  date?: string
  time?: string
  items: BillItem[]
  subtotal?: number
  discounts?: BillDiscount[]
  serviceCharge?: number
  tax?: number
  additionalFees?: AdditionalFee[]
  totalAmount?: number
  paymentMethod?: string
  currency?: string
  cashier?: string
  tableNumber?: string
}

export interface OCRResponse {
  success: boolean
  data?: ExtractedBillData
  error?: string
}