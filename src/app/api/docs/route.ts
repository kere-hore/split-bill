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
                    agent: {
                      type: 'string',
                      enum: ['gemini', 'deepseek'],
                      description: 'AI agent to use for extraction',
                      default: 'gemini',
                    }
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
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                  example: {
                    success: true,
                    data: {
                      merchant_name: 'Starbucks Coffee',
                      receipt_number: 'INV-2024-001234',
                      date: '2024-01-15',
                      time: '14:30',
                      items: [{
                        name: 'Cappuccino Grande',
                        quantity: 2,
                        unit_price: 45000,
                        total_price: 90000,
                        category: 'drink'
                      }],
                      subtotal: 90000,
                      discounts: [{
                        name: 'Member Discount',
                        amount: 9000,
                        type: 'percentage'
                      }],
                      service_charge: 8100,
                      tax: 8910,
                      additional_fees: [{
                        name: 'Delivery Fee',
                        amount: 5000
                      }],
                      total_amount: 103010,
                      payment_method: 'Credit Card',
                      currency: 'IDR'
                    },
                    message: 'Bill data extracted successfully'
                  }
                },
              },
            },
            400: {
              description: 'Bad request - Invalid input or file',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  examples: {
                    'missing-file': {
                      summary: 'No image file provided',
                      value: {
                        success: false,
                        error: {
                          message: 'Please upload an image file',
                          details: 'No file found in form data'
                        }
                      }
                    },
                    'invalid-file-type': {
                      summary: 'Invalid file type',
                      value: {
                        success: false,
                        error: {
                          message: 'Please upload a valid image file (JPEG, PNG, or WebP)',
                          details: 'File type "application/pdf" not supported. Allowed: image/jpeg, image/jpg, image/png, image/webp'
                        }
                      }
                    },
                    'invalid-agent': {
                      summary: 'Invalid AI agent',
                      value: {
                        success: false,
                        error: {
                          message: 'Invalid AI agent selected',
                          details: 'Agent "invalid" not supported. Available: gemini, deepseek'
                        }
                      }
                    }
                  }
                },
              },
            },
            422: {
              description: 'Unprocessable Entity - Processing failed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: {
                      message: 'Unable to process the image. Please try with a clearer image.',
                      details: 'JSON parsing failed: Unexpected token'
                    }
                  }
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: {
                      message: 'Something went wrong while processing your image. Please try again.',
                      details: 'AI service connection failed'
                    },
                    debug: {
                      timestamp: '2024-01-15T10:30:00Z',
                      endpoint: '/api/ocr/extract'
                    }
                  }
                },
              },
            },
          },
        },
      },
      '/users/search': {
        get: {
          summary: 'Search users by keyword',
          description: 'Search users by username, name, or email for adding to split bill groups',
          tags: ['Users'],
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: true,
              schema: { 
                type: 'string',
                minLength: 2
              },
              description: 'Search keyword (minimum 2 characters)',
              example: 'john'
            }
          ],
          responses: {
            200: {
              description: 'Users found successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' }
                      },
                      message: { type: 'string', example: 'Found 3 user(s)' }
                    }
                  },
                  example: {
                    success: true,
                    data: [
                      {
                        id: 'clx1234567890',
                        username: 'johndoe',
                        name: 'John Doe',
                        email: 'john@example.com',
                        image: 'https://example.com/avatar1.jpg'
                      },
                      {
                        id: 'clx0987654321',
                        username: 'johnsmith',
                        name: 'John Smith',
                        email: 'johnsmith@example.com',
                        image: null
                      }
                    ],
                    message: 'Found 2 user(s)'
                  }
                }
              }
            }
          }
        }
      }
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
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
              description: 'Indicates successful operation'
            },
            data: {
              $ref: '#/components/schemas/BillData',
              description: 'Extracted bill data'
            },
            message: {
              type: 'string',
              example: 'Bill data extracted successfully',
              description: 'Success message'
            }
          },
          required: ['success', 'data']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: 'Indicates failed operation'
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Please upload an image file',
                  description: 'User-friendly error message'
                },
                details: {
                  type: 'string',
                  example: 'No file found in form data',
                  description: 'Technical details for debugging'
                }
              },
              required: ['message']
            },
            debug: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-01-15T10:30:00Z'
                },
                endpoint: {
                  type: 'string',
                  example: '/api/ocr/extract'
                },
                stack: {
                  type: 'string',
                  description: 'Error stack trace (development only)'
                }
              },
              description: 'Debug information (only in development mode)'
            }
          },
          required: ['success', 'error']
        },
      },
    },
  }

  return NextResponse.json(swaggerSpec)
}