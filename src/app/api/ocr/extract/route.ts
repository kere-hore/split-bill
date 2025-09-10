import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.` },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64Image = Buffer.from(bytes).toString('base64')
    
    const mimeType = file.type

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
Analyze this receipt/bill image carefully and extract ALL financial information. Return ONLY valid JSON format:

{
  "merchant_name": "string - store/restaurant name",
  "receipt_number": "string - receipt/invoice number",
  "date": "string - date in YYYY-MM-DD format",
  "time": "string - time in HH:MM format",
  "items": [
    {
      "name": "string - item name",
      "quantity": "number - quantity (default 1 if not shown)",
      "unit_price": "number - price per unit",
      "total_price": "number - total for this item",
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
  "service_charge": "number - service charge amount",
  "tax": "number - tax amount (PPN/VAT/GST)",
  "additional_fees": [
    {
      "name": "string - fee name (delivery, packaging, etc)",
      "amount": "number - fee amount"
    }
  ],
  "total_amount": "number - final total amount",
  "payment_method": "string - cash/card/digital wallet",
  "currency": "string - currency code (IDR/USD/SGD etc)"
}

Rules:
- Extract ONLY numeric values for all amounts (no currency symbols, commas, or dots)
- Convert all prices to raw numbers: 15,000 → 15000, 1.500 → 1500
- Remove thousand separators: 1,234,567 → 1234567
- Use null for missing fields
- For items without quantity shown, use 1
- Look for discounts, promos, service charges, delivery fees
- Identify tax types (PPN 11%, VAT, GST, etc)
- Return valid JSON only, no explanations

Examples:
- "Rp 25,000" → 25000
- "$12.50" → 1250 (convert cents to raw number)
- "15.000,00" → 15000
- "1,234.56" → 123456
`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }

    const extractedData = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      data: extractedData,
    })
  } catch (error) {
    console.error('OCR extraction error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract data',
      },
      { status: 500 }
    )
  }
}