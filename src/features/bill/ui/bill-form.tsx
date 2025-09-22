"use client";

import { useForm, useFieldArray, useWatch, FieldErrors, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { billFormSchema, type BillFormData } from "../lib/bill-schema";
import { useEffect, useMemo, useState } from "react";

interface BillFormProps {
  initialData?: Partial<BillFormData>;
  onSubmit: (data: BillFormData) => void;
  isLoading?: boolean;
}

export function BillForm({
  initialData,
  onSubmit,
  isLoading = false,
}: BillFormProps) {
  const [hasUserModified, setHasUserModified] = useState(false);
  const [modifiedItems, setModifiedItems] = useState<Set<number>>(new Set());

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(billFormSchema),
    mode: "onChange",
    defaultValues: {
      merchantName: "",
      receiptNumber: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      items: [
        { name: "", quantity: 1, unitPrice: 0, totalPrice: 0, category: "" },
      ],
      subtotal: 0,
      discounts: [],
      serviceCharge: 0,
      tax: 0,
      additionalFees: [],
      totalAmount: 0,
      paymentMethod: "",
      currency: "IDR",
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
  } = useFieldArray({ control, name: "additionalFees" });

  // Watch specific fields for real-time updates
  const watchedItems = useWatch({ control, name: "items" });
  const watchedDiscounts = useWatch({ control, name: "discounts" });
  const watchedServiceCharge = useWatch({ control, name: "serviceCharge" });
  const watchedTax = useWatch({ control, name: "tax" });
  const watchedFees = useWatch({ control, name: "additionalFees" });

  // Calculate subtotal in real-time
  const calculatedSubtotal = useMemo(() => {
    if (!watchedItems) return 0;
    return watchedItems.reduce((sum, item) => {
      const quantity = item?.quantity || 0;
      const unitPrice = item?.unitPrice || 0;
      return sum + quantity * unitPrice;
    }, 0);
  }, [watchedItems]);

  // Calculate total amount in real-time
  const calculatedTotal = useMemo(() => {
    const discountTotal = (watchedDiscounts || []).reduce(
      (sum, discount) => sum + (discount?.amount || 0),
      0
    );
    const serviceCharge = watchedServiceCharge || 0;
    const tax = watchedTax || 0;
    const feesTotal = (watchedFees || []).reduce(
      (sum, fee) => sum + (fee?.amount || 0),
      0
    );

    return Math.max(
      0,
      calculatedSubtotal - discountTotal + serviceCharge + tax + feesTotal
    );
  }, [
    calculatedSubtotal,
    watchedDiscounts,
    watchedServiceCharge,
    watchedTax,
    watchedFees,
  ]);

  // Determine which values to display
  const displaySubtotal = hasUserModified
    ? calculatedSubtotal
    : initialData?.subtotal || calculatedSubtotal;
  const displayTotal = hasUserModified
    ? calculatedTotal
    : initialData?.totalAmount || calculatedTotal;

  // Function to get item total price
  const getItemTotalPrice = (index: number) => {
    const watchedItem = watchedItems?.[index];
    const initialItem = initialData?.items?.[index];

    // If this specific item hasn't been modified and has initial data, use it
    if (
      !modifiedItems.has(index) &&
      !hasUserModified &&
      initialItem?.totalPrice
    ) {
      return initialItem.totalPrice;
    }

    const quantity = watchedItem?.quantity || 0;
    const unitPrice = watchedItem?.unitPrice || 0;
    return quantity * unitPrice;
  };

  // Handle form submission
  const handleFormSubmit: SubmitHandler<BillFormData> = (data) => {
    console.log("Form submitted with data:", data);
    onSubmit(data);
  };

  // Handle form errors
  const handleFormError = (errors: FieldErrors<BillFormData>) => {
    console.log("Form validation errors:", errors);
  };

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        merchantName: initialData.merchantName || "",
        receiptNumber: initialData.receiptNumber || "",
        date: initialData.date || new Date().toISOString().split("T")[0],
        time: initialData.time || "",
        items: initialData.items || [
          {
            name: "",
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
            category: "",
          },
        ],
        subtotal: initialData.subtotal || 0,
        discounts: initialData.discounts || [],
        serviceCharge: initialData.serviceCharge || 0,
        tax: initialData.tax || 0,
        additionalFees: initialData.additionalFees || [],
        totalAmount: initialData.totalAmount || 0,
        paymentMethod: initialData.paymentMethod || "",
        currency: initialData.currency || "IDR",
      });
      setHasUserModified(false);
      setModifiedItems(new Set());
    }
  }, [initialData, reset]);

  // Auto-update calculated fields only after user modification
  useEffect(() => {
    if (hasUserModified) {
      setValue("subtotal", calculatedSubtotal);
      setValue("totalAmount", calculatedTotal);
    }
  }, [calculatedSubtotal, calculatedTotal, setValue, hasUserModified]);

  // Track user modifications on all relevant fields
  useEffect(() => {
    if (!initialData) return;

    // Track item-specific changes
    const newModifiedItems = new Set<number>();
    const hasItemsChanged = watchedItems?.some((item, index) => {
      const initialItem = initialData.items?.[index];
      const itemChanged =
        item?.quantity !== initialItem?.quantity ||
        item?.unitPrice !== initialItem?.unitPrice;
      if (itemChanged) {
        newModifiedItems.add(index);
      }
      return itemChanged;
    });

    if (newModifiedItems.size > 0) {
      setModifiedItems(newModifiedItems);
    }

    const hasDiscountsChanged =
      watchedDiscounts?.length !== (initialData.discounts?.length || 0) ||
      watchedDiscounts?.some((discount, index) => {
        const initialDiscount = initialData.discounts?.[index];
        return discount?.amount !== initialDiscount?.amount;
      });

    const hasFeesChanged =
      watchedFees?.length !== (initialData.additionalFees?.length || 0) ||
      watchedFees?.some((fee, index) => {
        const initialFee = initialData.additionalFees?.[index];
        return fee?.amount !== initialFee?.amount;
      });

    const hasServiceChargeChanged =
      watchedServiceCharge !== (initialData.serviceCharge || 0);
    const hasTaxChanged = watchedTax !== (initialData.tax || 0);

    if (
      hasItemsChanged ||
      hasDiscountsChanged ||
      hasFeesChanged ||
      hasServiceChargeChanged ||
      hasTaxChanged
    ) {
      setHasUserModified(true);
    }
  }, [
    watchedItems,
    watchedDiscounts,
    watchedFees,
    watchedServiceCharge,
    watchedTax,
    initialData,
  ]);

  // Debug form state
  console.log("Form errors:", errors);
  console.log("Form isValid:", isValid);

  return (
    <div className="max-w-sm mx-auto dark:bg-black bg-white border border-gray-200 rounded-lg p-4 font-mono text-sm">
      <form
        onSubmit={handleSubmit(handleFormSubmit, handleFormError)}
        className="space-y-4"
      >
        {/* Header */}
        <div className="text-center border-b pb-3">
          <Input
            {...register("merchantName")}
            placeholder="MERCHANT NAME"
            className="text-center font-bold border-none text-base p-0 h-auto"
            disabled={isLoading}
          />
          {errors.merchantName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.merchantName.message}
            </p>
          )}
          <Input
            type="date"
            {...register("date")}
            className="text-center text-xs border-none p-0 h-auto mt-1"
            disabled={isLoading}
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
              onClick={() => {
                appendItem({
                  name: "",
                  quantity: 1,
                  unitPrice: 0,
                  totalPrice: 0,
                  category: "",
                });
                setHasUserModified(true);
              }}
              className="h-6 px-2 text-xs"
              disabled={isLoading}
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
                  disabled={isLoading}
                />
                {itemFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      removeItem(index);
                      setHasUserModified(true);
                    }}
                    className="h-4 w-4 p-0 ml-2"
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <span>x</span>
                  <Input
                    type="number"
                    {...register(`items.${index}.unitPrice`, {
                      valueAsNumber: true,
                    })}
                    placeholder="Price"
                    className="w-16 text-xs border-none p-0 h-auto"
                    disabled={isLoading}
                  />
                </div>
                <div className="w-16 text-xs text-right text-muted-foreground">
                  {getItemTotalPrice(index).toLocaleString()}
                </div>
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
          <div className="w-20 text-xs text-right text-muted-foreground">
            {displaySubtotal.toLocaleString()}
          </div>
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
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      removeDiscount(index);
                      setHasUserModified(true);
                    }}
                    className="h-4 w-4 p-0"
                    disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            appendDiscount({ name: "", amount: 0, type: "fixed" });
            setHasUserModified(true);
          }}
          className="h-6 px-2 text-xs w-full"
          disabled={isLoading}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Discount
        </Button>

        {/* Service Charge */}
        <div className="flex justify-between text-xs">
          <span>Service Charge:</span>
          <Input
            type="number"
            {...register("serviceCharge", { valueAsNumber: true })}
            className="w-20 text-xs border-none p-0 h-auto text-right"
            placeholder="0"
            disabled={isLoading}
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
            disabled={isLoading}
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
                    {...register(`additionalFees.${index}.name`)}
                    placeholder="Fee name"
                    className="text-xs border-none p-0 h-auto w-20"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      removeFee(index);
                      setHasUserModified(true);
                    }}
                    className="h-4 w-4 p-0"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  type="number"
                  {...register(`additionalFees.${index}.amount`, {
                    valueAsNumber: true,
                  })}
                  className="w-16 text-xs border-none p-0 h-auto text-right"
                  placeholder="0"
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            appendFee({ name: "", amount: 0 });
            setHasUserModified(true);
          }}
          className="h-6 px-2 text-xs w-full"
          disabled={isLoading}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Fee
        </Button>

        <Separator className="my-3" />

        {/* Total */}
        <div className="flex justify-between text-sm font-bold border-t pt-2">
          <span>TOTAL:</span>
          <div className="w-24 text-sm font-bold text-right">
            {displayTotal.toLocaleString()}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-4 text-xs h-8"
          disabled={isLoading}
          onClick={() => console.log("Save Bill button clicked")}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Bill"
          )}
        </Button>
      </form>
    </div>
  );
}
