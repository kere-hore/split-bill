import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupName = searchParams.get("groupName") || "Split Bill";
    const merchantName = searchParams.get("merchantName") || "Restaurant";
    const totalAmount = searchParams.get("totalAmount") || "0";
    const memberCount = searchParams.get("memberCount") || "0";
    const date =
      searchParams.get("date") || new Date().toLocaleDateString("id-ID");

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8fafc",
            backgroundImage:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              borderRadius: "24px",
              padding: "60px",
              margin: "40px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              width: "90%",
              maxWidth: "1000px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "48px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "20px",
              }}
            >
              💰 Split Bill
            </div>

            <div
              style={{
                display: "flex",
                fontSize: "36px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              {groupName}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: "24px",
                color: "#6b7280",
                marginBottom: "40px",
                textAlign: "center",
              }}
            >
              {merchantName} • {date}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                width: "100%",
                gap: "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "16px",
                  padding: "24px",
                  minWidth: "200px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "#059669",
                    marginBottom: "8px",
                  }}
                >
                  Rp {totalAmount}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "18px",
                    color: "#6b7280",
                  }}
                >
                  Total Amount
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "16px",
                  padding: "24px",
                  minWidth: "200px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "#3b82f6",
                    marginBottom: "8px",
                  }}
                >
                  {memberCount}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "18px",
                    color: "#6b7280",
                  }}
                >
                  Members
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
