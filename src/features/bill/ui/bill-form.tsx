"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { billFormSchema, type BillFormData } from "../lib/bill-schema";

interface BillFormProps {
  initialData?: Partial<BillFormData>;
  onSubmit: (data: BillFormData) => void;
}

export function BillForm({ initialData, onSubmit }: BillFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BillFormData>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      merchant_name: "",
      date: new Date().toISOString().split("T")[0],
      items: [
        { name: "", quantity: 1, unit_price: 0, total_price: 0, category: "" },
      ],
      subtotal: 0,
      discounts: [],
      service_charge: 0,
      tax: 0,
      additional_fees: [],
      total_amount: 0,
      payment_method: "",
      currency: "IDR",
      ...initialData,
    },
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control, name: "items" });

  const {
    fields: discountFields,
    append: appendDiscount,
    remove: removeDiscount,
  } = useFieldArray({ control, name: "discounts" });

  const {
    fields: feeFields,
    append: appendFee,
    remove: removeFee,
  } = useFieldArray({ control, name: "additional_fees" });

  return (
    <div className="max-w-sm mx-auto bg-white border border-gray-200 rounded-lg p-4 font-mono text-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Header */}
        <div className="text-center border-b pb-3">
          <Input
            {...register("merchant_name")}
            placeholder="MERCHANT NAME"
            className="text-center font-bold border-none text-base p-0 h-auto"
          />
          {errors.merchant_name && (
            <p className="text-xs text-red-500 mt-1">
              {errors.merchant_name.message}
            </p>
          )}
          <Input
            type="date"
            {...register("date")}
            className="text-center text-xs border-none p-0 h-auto mt-1"
          />
        </div>

        {/* Items */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold">ITEMS:</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                appendItem({
                  name: "",
                  quantity: 1,
                  unit_price: 0,
                  total_price: 0,
                  category: "",
                })
              }
              className="h-6 px-2 text-xs"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {itemFields.map((field, index) => (
            <div key={field.id} className="space-y-1">
              <div className="flex justify-between items-center">
                <Input
                  {...register(`items.${index}.name`)}
                  placeholder="Item name"
                  className="text-xs border-none p-0 h-auto flex-1"
                />
                {itemFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="h-4 w-4 p-0 ml-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex justify-between text-xs">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    placeholder="Qty"
                    className="w-12 text-xs border-none p-0 h-auto"
                  />
                  <span>x</span>
                  <Input
                    type="number"
                    {...register(`items.${index}.unit_price`, {
                      valueAsNumber: true,
                    })}
                    placeholder="Price"
                    className="w-16 text-xs border-none p-0 h-auto"
                  />
                </div>
                <Input
                  type="number"
                  {...register(`items.${index}.total_price`, {
                    valueAsNumber: true,
                  })}
                  placeholder="Total"
                  className="w-16 text-xs border-none p-0 h-auto text-right"
                />
              </div>
              {errors.items?.[index]?.name && (
                <p className="text-xs text-red-500">
                  {errors.items[index]?.name?.message}
                </p>
              )}
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        {/* Subtotal */}
        <div className="flex justify-between text-xs">
          <span>Subtotal:</span>
          <Input
            type="number"
            {...register("subtotal", { valueAsNumber: true })}
            className="w-20 text-xs border-none p-0 h-auto text-right"
            placeholder="0"
          />
        </div>

        {/* Discounts */}
        {discountFields.length > 0 && (
          <div className="space-y-1">
            {discountFields.map((field, index) => (
              <div
                key={field.id}
                className="flex justify-between items-center text-xs"
              >
                <div className="flex items-center gap-1">
                  <Input
                    {...register(`discounts.${index}.name`)}
                    placeholder="Discount"
                    className="text-xs border-none p-0 h-auto w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDiscount(index)}
                    className="h-4 w-4 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  type="number"
                  {...register(`discounts.${index}.amount`, {
                    valueAsNumber: true,
                  })}
                  className="w-16 text-xs border-none p-0 h-auto text-right"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => appendDiscount({ name: "", amount: 0, type: "fixed" })}
          className="h-6 px-2 text-xs w-full"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Discount
        </Button>

        {/* Service Charge */}
        <div className="flex justify-between text-xs">
          <span>Service Charge:</span>
          <Input
            type="number"
            {...register("service_charge", { valueAsNumber: true })}
            className="w-20 text-xs border-none p-0 h-auto text-right"
            placeholder="0"
          />
        </div>

        {/* Tax */}
        <div className="flex justify-between text-xs">
          <span>Tax:</span>
          <Input
            type="number"
            {...register("tax", { valueAsNumber: true })}
            className="w-20 text-xs border-none p-0 h-auto text-right"
            placeholder="0"
          />
        </div>

        {/* Additional Fees */}
        {feeFields.length > 0 && (
          <div className="space-y-1">
            {feeFields.map((field, index) => (
              <div
                key={field.id}
                className="flex justify-between items-center text-xs"
              >
                <div className="flex items-center gap-1">
                  <Input
                    {...register(`additional_fees.${index}.name`)}
                    placeholder="Fee name"
                    className="text-xs border-none p-0 h-auto w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFee(index)}
                    className="h-4 w-4 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  type="number"
                  {...register(`additional_fees.${index}.amount`, {
                    valueAsNumber: true,
                  })}
                  className="w-16 text-xs border-none p-0 h-auto text-right"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => appendFee({ name: "", amount: 0 })}
          className="h-6 px-2 text-xs w-full"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Fee
        </Button>

        <Separator className="my-3" />

        {/* Total */}
        <div className="flex justify-between text-sm font-bold border-t pt-2">
          <span>TOTAL:</span>
          <Input
            type="number"
            {...register("total_amount", { valueAsNumber: true })}
            className="w-24 text-sm font-bold border-none p-0 h-auto text-right"
            placeholder="0"
          />
        </div>

        <Button type="submit" className="w-full mt-4 text-xs h-8">
          Save Bill
        </Button>
      </form>
    </div>
  );
}
