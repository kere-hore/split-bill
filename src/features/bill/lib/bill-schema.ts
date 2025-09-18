import { z } from "zod";

export const billItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price must be positive"),
  total_price: z.number().min(0, "Total price must be positive"),
  category: z.string().nullable().optional(),
});

export const discountSchema = z.object({
  name: z.string().min(1, "Discount name is required"),
  amount: z.number().min(0, "Discount amount must be positive"),
  type: z.enum(["percentage", "fixed"]),
});

export const additionalFeeSchema = z.object({
  name: z.string().min(1, "Fee name is required"),
  amount: z.number().min(0, "Fee amount must be positive"),
});

export const billFormSchema = z.object({
  merchant_name: z.string().min(1, "Merchant name is required"),
  receipt_number: z.string().nullable().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().nullable().optional(),
  items: z.array(billItemSchema).min(1, "At least one item is required"),
  subtotal: z.number().min(0, "Subtotal must be positive"),
  discounts: z.array(discountSchema).default([]),
  service_charge: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  additional_fees: z.array(additionalFeeSchema).default([]),
  total_amount: z.number().min(0, "Total amount must be positive"),
  payment_method: z.string().nullable().optional(),
  currency: z.string().min(1, "Currency is required"),
});

export type BillFormData = z.infer<typeof billFormSchema>;
export type BillItem = z.infer<typeof billItemSchema>;
export type Discount = z.infer<typeof discountSchema>;
export type AdditionalFee = z.infer<typeof additionalFeeSchema>;