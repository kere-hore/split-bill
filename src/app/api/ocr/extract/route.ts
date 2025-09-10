import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { createSuccessResponse, createErrorResponse } from '@/shared/lib/api-response'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: 'https://api.deepseek.com/v1'
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const agent = (formData.get('agent') as string) || 'gemini'
    
    if (!file) {
      return createErrorResponse(
        'Please upload an image file',
        400,
        'No file found in form data',
        '/api/ocr/extract'
      )
    }

    // Validate agent
    if (!['gemini', 'deepseek'].includes(agent)) {
      return createErrorResponse(
        'Invalid AI agent selected',
        400,
        `Agent "${agent}" not supported. Available: gemini, deepseek`,
        '/api/ocr/extract'
      )
    }

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse(
        'Please upload a valid image file (JPEG, PNG, or WebP)',
        400,
        `File type "${file.type}" not supported. Allowed: ${allowedTypes.join(', ')}`,
        '/api/ocr/extract'
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64Image = Buffer.from(bytes).toString('base64')
    
    const mimeType = file.type

    let extractedData

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

    if (agent === 'gemini') {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
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

      extractedData = JSON.parse(jsonMatch[0])
    } else if (agent === 'deepseek') {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      })
      console.log(response)
      const text = response.choices[0]?.message?.content || ''
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response')
      }

      extractedData = JSON.parse(jsonMatch[0])
    }

    return createSuccessResponse(
      extractedData,
      'Bill data extracted successfully'
    )
  } catch (error) {
    console.error('OCR extraction error:', error)
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return createErrorResponse(
        'Unable to process the image. Please try with a clearer image.',
        422,
        `JSON parsing failed: ${error.message}`,
        '/api/ocr/extract'
      )
    }
    
    return createErrorResponse(
      'Something went wrong while processing your image. Please try again.',
      500,
      error instanceof Error ? error.message : 'Unknown error occurred',
      '/api/ocr/extract'
    )
  }
}