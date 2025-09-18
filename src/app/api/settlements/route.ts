import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const querySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  status: z.enum(["outstanding", "allocated", "all"]).optional().default("all"),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, status } = querySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
    });

    // Mock data - replace with actual database query
    const allSettlements = [
      {
        id: "1",
        merchant_name: "McDonald's",
        total_amount: 150000,
        date: "2024-01-15T10:30:00Z",
        status: "outstanding",
        member_count: 0,
        currency: "IDR",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        merchant_name: "Starbucks Coffee",
        total_amount: 280000,
        date: "2024-01-14T15:45:00Z",
        status: "allocated",
        member_count: 4,
        currency: "IDR",
        created_at: "2024-01-14T15:45:00Z",
        updated_at: "2024-01-14T16:00:00Z",
      },
      {
        id: "3",
        merchant_name: "Pizza Hut",
        total_amount: 450000,
        date: "2024-01-13T19:20:00Z",
        status: "outstanding",
        member_count: 0,
        currency: "IDR",
        created_at: "2024-01-13T19:20:00Z",
        updated_at: "2024-01-13T19:20:00Z",
      },
      {
        id: "4",
        merchant_name: "KFC",
        total_amount: 320000,
        date: "2024-01-12T12:15:00Z",
        status: "allocated",
        member_count: 3,
        currency: "IDR",
        created_at: "2024-01-12T12:15:00Z",
        updated_at: "2024-01-12T13:00:00Z",
      },
      {
        id: "5",
        merchant_name: "Burger King",
        total_amount: 180000,
        date: "2024-01-11T18:30:00Z",
        status: "outstanding",
        member_count: 0,
        currency: "IDR",
        created_at: "2024-01-11T18:30:00Z",
        updated_at: "2024-01-11T18:30:00Z",
      },
    ];

    // Filter by status
    const filteredSettlements = status === "all" 
      ? allSettlements 
      : allSettlements.filter(s => s.status === status);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const settlements = filteredSettlements.slice(startIndex, endIndex);
    
    const totalCount = filteredSettlements.length;
    const hasMore = endIndex < totalCount;

    return NextResponse.json({
      success: true,
      data: {
        settlements,
        pagination: {
          page,
          limit,
          total: totalCount,
          hasMore,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching settlements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}