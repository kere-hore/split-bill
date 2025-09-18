export interface BillItem {
  name: string
  quantity: number
  unit_price: number
  total_price: number
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
  merchant_name?: string
  merchant_address?: string
  receipt_number?: string
  date?: string
  time?: string
  items: BillItem[]
  subtotal?: number
  discounts?: BillDiscount[]
  service_charge?: number
  tax?: number
  additional_fees?: AdditionalFee[]
  total_amount?: number
  payment_method?: string
  currency?: string
  cashier?: string
  table_number?: string
}

export interface OCRResponse {
  success: boolean
  data?: ExtractedBillData
  error?: string
}