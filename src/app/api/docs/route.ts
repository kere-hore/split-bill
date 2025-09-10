import { NextResponse } from 'next/server'

export async function GET() {
  const swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Split Bill API',
      version: '1.0.0',
      description: 'Complete API documentation for Split Bill application',
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    paths: {
      '/ocr/extract': {
        post: {
          summary: 'Extract bill data from image',
          description: 'Upload a receipt/bill image and extract structured data using Gemini AI',
          tags: ['OCR'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    image: {
                      type: 'string',
                      format: 'binary',
                      description: 'Receipt/bill image file (JPEG, PNG, WebP)',
                    },
                  },
                  required: ['image'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Successfully extracted bill data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/BillData' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        BillData: {
          type: 'object',
          properties: {
            merchant_name: { type: 'string', nullable: true, example: 'Starbucks Coffee' },
            receipt_number: { type: 'string', nullable: true, example: 'INV-2024-001234' },
            date: { type: 'string', nullable: true, format: 'date', example: '2024-01-15' },
            time: { type: 'string', nullable: true, example: '14:30' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/BillItem' },
            },
            subtotal: { type: 'number', nullable: true, example: 90000 },
            discounts: {
              type: 'array',
              items: { $ref: '#/components/schemas/Discount' },
            },
            service_charge: { type: 'number', nullable: true, example: 8100 },
            tax: { type: 'number', nullable: true, example: 8910 },
            additional_fees: {
              type: 'array',
              items: { $ref: '#/components/schemas/AdditionalFee' },
            },
            total_amount: { type: 'number', nullable: true, example: 103010 },
            payment_method: { type: 'string', nullable: true, example: 'Credit Card' },
            currency: { type: 'string', nullable: true, example: 'IDR' },
          },
        },
        BillItem: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Cappuccino Grande' },
            quantity: { type: 'number', example: 2 },
            unit_price: { type: 'number', example: 45000 },
            total_price: { type: 'number', example: 90000 },
            category: { type: 'string', nullable: true, example: 'drink' },
          },
        },
        Discount: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Member Discount' },
            amount: { type: 'number', example: 9000 },
            type: { type: 'string', example: 'percentage' },
          },
        },
        AdditionalFee: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Delivery Fee' },
            amount: { type: 'number', example: 5000 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Failed to extract data' },
          },
        },
      },
    },
  }

  return NextResponse.json(swaggerSpec)
}