import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { billFormSchema } from "@/features/bill/lib/bill-schema";
import {
  BillItem,
  BillDiscount,
  BillFee,
} from "@/shared/api/contract/bills/types";
import { prisma } from "@/shared/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/bills"
      );
    }

    const body = await request.json();

    const validatedData = billFormSchema.parse(body);

    // Use transaction to create bill and group together
    const result = await prisma.$transaction(async (tx) => {
      // Ensure user exists in database
      await tx.user.upsert({
        where: { clerkId: userId },
        update: {},
        create: {
          clerkId: userId,
          username: `user_${userId.slice(-8)}`,
          name: "User",
          email: `${userId}@temp.com`,
        },
      });

      // Get user for foreign key
      const user = await tx.user.findUnique({
        where: { clerkId: userId },
        select: { id: true },
      });

      if (!user) {
        throw new Error("Failed to create or find user");
      }

      // Create bill
      const bill = await tx.bill.create({
        data: {
          merchantName: validatedData.merchantName || "",
          receiptNumber: validatedData.receiptNumber || null,
          date: new Date(validatedData.date),
          time: validatedData.time || null,
          subtotal: validatedData.subtotal || 0,
          serviceCharge: validatedData.serviceCharge || 0,
          tax: validatedData.tax || 0,
          totalAmount: validatedData.totalAmount || 0,
          paymentMethod: validatedData.paymentMethod || null,
          currency: validatedData.currency || "IDR",
          createdBy: userId,
          items: {
            create: validatedData.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice || 0,
              totalPrice: item.totalPrice || 0,
              category: item.category || null,
            })),
          },
          discounts: {
            create: (validatedData.discounts || []).map((discount) => ({
              name: discount.name,
              amount: discount.amount,
              type: discount.type,
            })),
          },
          additionalFees: {
            create: (validatedData.additionalFees || []).map((fee) => ({
              name: fee.name,
              amount: fee.amount,
            })),
          },
        },
        include: {
          items: true,
          discounts: true,
          additionalFees: true,
        },
      });

      // Auto-create group for settlement
      const group = await tx.group.create({
        data: {
          name: `${validatedData.merchantName || "Bill"} - ${new Date(
            validatedData.date
          ).toLocaleDateString()}`,
          description: `Split bill for ${validatedData.merchantName || "Bill"}`,
          billId: bill.id, // Link group to bill
          createdBy: user.id,
        },
      });

      return { bill, group };
    });

    const { bill, group } = result;

    // Transform to snake_case response format
    const response = {
      id: bill.id,
      merchant_name: bill.merchantName,
      receipt_number: bill.receiptNumber,
      date: bill.date.toISOString().split("T")[0],
      time: bill.time,
      subtotal: Number(bill.subtotal),
      service_charge: Number(bill.serviceCharge),
      tax: Number(bill.tax),
      total_amount: Number(bill.totalAmount),
      payment_method: bill.paymentMethod,
      currency: bill.currency,
      created_by: bill.createdBy,
      created_at: bill.createdAt.toISOString(),
      updated_at: bill.updatedAt.toISOString(),
      items: bill.items.map(
        (item): BillItem => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: Number(item.unitPrice),
          total_price: Number(item.totalPrice),
          category: item.category,
        })
      ),
      discounts: bill.discounts.map(
        (discount): BillDiscount => ({
          id: discount.id,
          name: discount.name,
          amount: Number(discount.amount),
          type: discount.type,
        })
      ),
      additional_fees: bill.additionalFees.map(
        (fee): BillFee => ({
          id: fee.id,
          name: fee.name,
          amount: Number(fee.amount),
        })
      ),
    };

    // Note: Cache invalidation should be handled on client-side using React Query
    // Client should call useInvalidateGroups().invalidateAll() after successful bill creation
    
    return createSuccessResponse(
      { ...response, groupId: group.id },
      "Bill and group created successfully"
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return createErrorResponse(
        "Invalid bill data",
        400,
        error.message,
        "/api/bills"
      );
    }

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      return createErrorResponse(
        "Database error occurred",
        500,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `Database error: ${(error as any).message}`,
        "/api/bills"
      );
    }

    return createErrorResponse(
      "Failed to create bill",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/bills"
    );
  }
}
