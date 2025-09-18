import {
  createErrorResponse,
  createSuccessResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = searchParams.get("limit") || 10;
    if (!query || query.trim().length < 2) {
      return createErrorResponse(
        "Search query must be at least 2 characters long",
        400,
        'Query parameter "q" is missing or too short',
        "/api/users/search"
      );
    }

    // Check if query is an email
    const isEmail = query.includes("@");

    const users = await prisma.user.findMany({
      where: {
        ...(isEmail
          ? { email: { contains: query, mode: "insensitive" } }
          : {
              OR: [
                { username: { contains: query, mode: "insensitive" } },
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            }),
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        image: true,
      },
      take: Number(limit),
    });

    return createSuccessResponse(users, `Found ${users.length} successfully`);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse(
        "Failed to search users",
        422,
        `JSON parsing failed: ${error.message}`,
        "/api/users/search"
      );
    }
    return createErrorResponse(
      "Something went wrong while searching users",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/users/search"
    );
  }
}
