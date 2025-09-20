/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  TextractClient,
  AnalyzeExpenseCommand,
} from "@aws-sdk/client-textract";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const textractClient = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const OCR_PROMPT = `
Analyze this receipt/bill image carefully and extract ALL financial information. Return ONLY valid JSON format:

{
  "merchantName": "string - store/restaurant name",
  "receiptNumber": "string - receipt/invoice number", 
  "date": "string - date in YYYY-MM-DD format",
  "time": "string - time in HH:MM format",
  "items": [
    {
      "name": "string - item name",
      "quantity": "number - quantity (default 1 if not shown)",
      "unitPrice": "number - price per unit (calculate from totalPrice/quantity if not shown)", 
      "totalPrice": "number - total for this item",
      "category": "string - food/drink/service etc"
    }
  ],
  "subtotal": "number - subtotal before tax/service",
  "discounts": [
    {
      "name": "string - discount name/type",
      "amount": "number - discount amount",
      "type": "string - percentage/fixed"
    }
  ],
  "serviceCharge": "number - service charge amount",
  "tax": "number - tax amount (PPN/VAT/GST)",
  "additionalFees": [
    {
      "name": "string - fee name (delivery, packaging, etc)",
      "amount": "number - fee amount"
    }
  ],
  "totalAmount": "number - final total amount",
  "paymentMethod": "string - cash/card/digital wallet",
  "currency": "string - currency code (IDR/USD/SGD etc)"
}

CRITICAL NUMBER PARSING RULES:
- Extract ONLY numeric values for all amounts (no currency symbols, commas, or dots as thousand separators)
- Indonesian format: "27.520" means 27520 (dot as thousand separator)
- Indonesian format: "1.500.000" means 1500000 (dots as thousand separators)
- Remove ALL formatting: commas, dots, spaces from numbers
- Convert to raw integers only

ITEM EXTRACTION RULES:
- If only total price is shown (like "3x SIOMAY AYAM Rp 40500"), extract:
  * quantity: 3
  * name: "SIOMAY AYAM"
  * totalPrice: 40500
  * unitPrice: 13500 (40500/3)
- If unit price is shown separately, use that value
- If no quantity shown, assume quantity: 1 and unitPrice = totalPrice
- Look for patterns like "2x ITEM NAME Rp 50000" or "ITEM NAME x3 Rp 30000"

EXAMPLES OF CORRECT EXTRACTION:
- "3x SIOMAY AYAM Rp 40500" → quantity: 3, name: "SIOMAY AYAM", totalPrice: 40500, unitPrice: 13500
- "1x MIE GACOAN LV 3 Rp 14500" → quantity: 1, name: "MIE GACOAN LV 3", totalPrice: 14500, unitPrice: 14500
- "UDANG KEJU Rp 40500" → quantity: 1, name: "UDANG KEJU", totalPrice: 40500, unitPrice: 40500

EXAMPLES OF CORRECT NUMBER CONVERSION:
- "Rp 27.520" → 27520
- "Rp 1.500.000" → 1500000  
- "15.000" → 15000
- "2.500.000" → 2500000

IMPORTANT:
- Use null for missing fields
- Look for discounts, promos, service charges, delivery fees
- Identify tax types (PPN 11%, VAT, GST, etc)
- Return valid JSON only, no explanations
- Pay special attention to Indonesian number formatting with dots as thousand separators
- Calculate unitPrice from totalPrice/quantity when unit price is not explicitly shown
`;

function findField(fields: any[], type: string) {
  return (
    fields?.find((f: any) => f.Type?.Text === type)?.ValueDetection?.Text ||
    null
  );
}

function parseAmount(value: string | null): number {
  if (!value) return 0;

  // Remove currency symbols and common prefixes
  let cleanValue = value.replace(/[Rp\$€£¥₹]/g, "").trim();

  // Remove common suffixes like ",-"
  cleanValue = cleanValue.replace(/[,-]+$/, "");

  // For Indonesian format, dots are thousand separators
  // Remove all dots and commas, keep only digits
  cleanValue = cleanValue.replace(/[.,\s]/g, "");

  return parseFloat(cleanValue) || 0;
}

function extractDiscountsAndFees(summaryFields: any[]) {
  const discounts: any[] = [];
  const additionalFees: any[] = [];
  let serviceCharge = 0;

  // Look for common discount/fee patterns in summary fields
  summaryFields.forEach((field: any) => {
    const fieldType = field.Type?.Text?.toLowerCase() || "";
    const fieldValue = field.ValueDetection?.Text || "";
    const amount = parseAmount(fieldValue);

    if (amount > 0) {
      // Discount patterns
      if (
        fieldType.includes("discount") ||
        fieldType.includes("promo") ||
        fieldType.includes("coupon") ||
        fieldType.includes("rebate")
      ) {
        discounts.push({
          name: fieldType
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l: any) => l.toUpperCase()),
          amount: amount,
          type: "fixed",
        });
      }
      // Service charge patterns
      else if (
        fieldType.includes("service") ||
        fieldType.includes("gratuity") ||
        fieldType.includes("tip")
      ) {
        serviceCharge = amount;
      }
      // Additional fees patterns
      else if (
        fieldType.includes("delivery") ||
        fieldType.includes("packaging") ||
        fieldType.includes("convenience") ||
        fieldType.includes("processing") ||
        fieldType.includes("handling") ||
        fieldType.includes("fee")
      ) {
        additionalFees.push({
          name: fieldType
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l: any) => l.toUpperCase()),
          amount: amount,
        });
      }
    }
  });

  return { discounts, additionalFees, serviceCharge };
}

async function extractWithGemini(base64Image: string, mimeType: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    OCR_PROMPT,
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
  ]);

  const response = await result.response;
  return response.text();
}

async function extractWithTextract(imageBytes: ArrayBuffer) {
  const command = new AnalyzeExpenseCommand({
    Document: {
      Bytes: new Uint8Array(imageBytes),
    },
  });

  const result = await textractClient.send(command);
  const expenseDoc = result.ExpenseDocuments?.[0];
  const summaryFields = expenseDoc?.SummaryFields || [];
  const lineItems = expenseDoc?.LineItemGroups?.[0]?.LineItems || [];

  // Extract discounts, fees, and service charges
  const { discounts, additionalFees, serviceCharge } =
    extractDiscountsAndFees(summaryFields);

  // Transform Textract response to our JSON format
  const extractedData = {
    merchantName: findField(summaryFields, "VENDOR_NAME"),
    receiptNumber: findField(summaryFields, "INVOICE_RECEIPT_ID"),
    date: findField(summaryFields, "INVOICE_RECEIPT_DATE"),
    time: findField(summaryFields, "INVOICE_RECEIPT_TIME"),
    items: lineItems.map((item: any) => {
      const quantity =
        parseAmount(findField(item.LineItemExpenseFields, "QUANTITY")) || 1;
      const totalPrice =
        parseAmount(findField(item.LineItemExpenseFields, "PRICE")) || 0;
      const unitPrice = quantity > 0 ? totalPrice / quantity : totalPrice;

      return {
        name: findField(item.LineItemExpenseFields, "ITEM") || "Unknown Item",
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        category: findField(item.LineItemExpenseFields, "PRODUCT_CODE") || null,
      };
    }),
    subtotal: parseAmount(findField(summaryFields, "SUBTOTAL")),
    discounts: discounts,
    serviceCharge:
      serviceCharge || parseAmount(findField(summaryFields, "SERVICE_CHARGE")),
    tax:
      parseAmount(findField(summaryFields, "TAX")) ||
      parseAmount(findField(summaryFields, "TAX_PAYER_ID")),
    additionalFees: additionalFees,
    totalAmount: parseAmount(findField(summaryFields, "TOTAL")),
    paymentMethod: findField(summaryFields, "PAYMENT_METHOD"),
    currency: findField(summaryFields, "CURRENCY") || "IDR",
  };

  return JSON.stringify(extractedData);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return createErrorResponse(
        "Please upload an image file",
        400,
        "No file found in form data",
        "/api/ocr/extract"
      );
    }

    // Validate mime type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse(
        "Please upload a valid image file (JPEG, PNG, or WebP)",
        400,
        `File type "${file.type}" not supported. Allowed: ${allowedTypes.join(
          ", "
        )}`,
        "/api/ocr/extract"
      );
    }

    // Convert file to base64 and bytes
    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");
    const mimeType = file.type;

    let text = "";
    let usedAgent = "gemini";

    try {
      // Try Gemini first
      text = await extractWithGemini(base64Image, mimeType);
    } catch (geminiError: any) {
      console.warn("Gemini failed, trying Textract:", geminiError?.message);

      // Fallback to Textract if Gemini fails
      try {
        // text = await extractWithTextract(bytes);
        usedAgent = "textract";
      } catch (textractError: any) {
        console.error("Both agents failed:", { geminiError, textractError });

        // Handle quota errors specifically
        if (
          geminiError?.status === 429 ||
          geminiError?.message?.includes("quota")
        ) {
          return createErrorResponse(
            "OCR service is temporarily unavailable due to high usage. Please try again later.",
            429,
            "OCR agents quota exceeded",
            "/api/ocr/extract"
          );
        }

        throw textractError;
      }
    }

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    return createSuccessResponse(
      {
        ...JSON.parse(jsonMatch[0]),
        _meta: { agent: usedAgent },
      },
      `Bill data extracted successfully using ${usedAgent}`
    );
  } catch (error: any) {
    console.error("OCR extraction error:", error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return createErrorResponse(
        "Unable to process the image. Please try with a clearer image.",
        422,
        `JSON parsing failed: ${error.message}`,
        "/api/ocr/extract"
      );
    }

    return createErrorResponse(
      "Something went wrong while processing your image. Please try again.",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/ocr/extract"
    );
  }
}
