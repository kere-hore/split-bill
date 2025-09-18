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
      '/bills': {
        post: {
          summary: 'Create a new bill',
          description: 'Create a new bill with items, discounts, and fees for split bill management',
          tags: ['Bills'],
          security: [{ ClerkAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateBillRequest' },
                example: {
                  merchant_name: 'GrabFood',
                  receipt_number: 'A-7HHS27VWWJJQ',
                  date: '2025-02-19',
                  time: '12:48',
                  items: [
                    {
                      name: 'MIE GACOAN LV 3',
                      quantity: 1,
                      unit_price: 14500,
                      total_price: 14500,
                      category: 'food'
                    },
                    {
                      name: 'SIOMAY AYAM',
                      quantity: 3,
                      unit_price: 13500,
                      total_price: 40500,
                      category: 'food'
                    }
                  ],
                  subtotal: 283000,
                  discounts: [],
                  service_charge: 0,
                  tax: 0,
                  additional_fees: [
                    {
                      name: 'Biaya Pengiriman',
                      amount: 11000
                    },
                    {
                      name: 'Biaya Pemesanan',
                      amount: 5500
                    }
                  ],
                  total_amount: 274500,
                  payment_method: 'Visa',
                  currency: 'IDR'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Bill created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateBillResponse' },
                  example: {
                    success: true,
                    data: {
                      id: 'clx1234567890',
                      merchant_name: 'GrabFood',
                      receipt_number: 'A-7HHS27VWWJJQ',
                      date: '2025-02-19',
                      time: '12:48',
                      subtotal: 283000,
                      service_charge: 0,
                      tax: 0,
                      total_amount: 274500,
                      payment_method: 'Visa',
                      currency: 'IDR',
                      created_by: 'user_2abc123def456',
                      created_at: '2025-02-19T12:48:00.000Z',
                      updated_at: '2025-02-19T12:48:00.000Z',
                      items: [
                        {
                          id: 'item_1',
                          name: 'MIE GACOAN LV 3',
                          quantity: 1,
                          unit_price: 14500,
                          total_price: 14500,
                          category: 'food'
                        }
                      ],
                      discounts: [],
                      additional_fees: [
                        {
                          id: 'fee_1',
                          name: 'Biaya Pengiriman',
                          amount: 11000
                        }
                      ]
                    },
                    message: 'Bill created successfully'
                  }
                }
              }
            },
            400: {
              description: 'Invalid bill data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: {
                      message: 'Invalid bill data',
                      details: 'Merchant name is required'
                    }
                  }
                }
              }
            },
            401: {
              description: 'Authentication required',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: {
                      message: 'Authentication required',
                      details: 'User not authenticated'
                    }
                  }
                }
              }
            },
            500: {
              description: 'Database or server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: {
                      message: 'Failed to create bill',
                      details: 'Database connection failed'
                    }
                  }
                }
              }
            }
          }
        }
      },
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
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                },
              },
            },
            422: {
              description: 'Unprocessable Entity - Processing failed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
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
                  }
                }
              }
            }
          }
        }
      },
      '/groups': {
        get: {
          summary: 'Get user groups with pagination',
          description: 'Retrieve all groups created by the authenticated user with optional filtering and pagination',
          tags: ['Groups'],
          security: [{ ClerkAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { 
                type: 'integer',
                minimum: 1,
                default: 1
              },
              description: 'Page number for pagination',
              example: 1
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { 
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 10
              },
              description: 'Number of groups per page',
              example: 10
            },
            {
              name: 'status',
              in: 'query',
              required: false,
              schema: { 
                type: 'string',
                enum: ['outstanding', 'allocated', 'all'],
                default: 'all'
              },
              description: 'Filter groups by allocation status',
              example: 'outstanding'
            }
          ],
          responses: {
            200: {
              description: 'Groups retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GetGroupsResponse' },
                  example: {
                    success: true,
                    message: 'Groups retrieved successfully',
                    data: {
                      groups: [
                        {
                          id: 'clx1234567890',
                          name: 'McDonald\'s - 15/01/2024',
                          description: 'Split bill for McDonald\'s',
                          member_count: 0,
                          status: 'outstanding',
                          created_at: '2024-01-15T10:30:00.000Z',
                          updated_at: '2024-01-15T10:30:00.000Z',
                          members: []
                        },
                        {
                          id: 'clx0987654321',
                          name: 'Starbucks Coffee - 14/01/2024',
                          description: 'Split bill for Starbucks Coffee',
                          member_count: 3,
                          status: 'allocated',
                          created_at: '2024-01-14T15:45:00.000Z',
                          updated_at: '2024-01-14T16:00:00.000Z',
                          members: [
                            {
                              id: 'member_1',
                              role: 'admin',
                              user: {
                                id: 'user_1',
                                name: 'John Doe',
                                email: 'john@example.com'
                              }
                            }
                          ]
                        }
                      ],
                      pagination: {
                        page: 1,
                        limit: 10,
                        total: 2,
                        hasMore: false,
                        totalPages: 1
                      }
                    },
                    timestamp: '2024-01-15T10:30:00.000Z'
                  }
                }
              }
            },
            400: {
              description: 'Invalid query parameters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: 'Invalid query parameters',
                    message: 'Page must be a positive integer',
                    path: '/api/groups',
                    timestamp: '2024-01-15T10:30:00.000Z'
                  }
                }
              }
            },
            401: {
              description: 'Authentication required',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: 'Authentication required',
                    message: 'User not authenticated',
                    path: '/api/groups',
                    timestamp: '2024-01-15T10:30:00.000Z'
                  }
                }
              }
            },
            404: {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: 'User not found',
                    message: 'User does not exist in database',
                    path: '/api/groups',
                    timestamp: '2024-01-15T10:30:00.000Z'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: 'Failed to fetch groups',
                    message: 'Database connection failed',
                    path: '/api/groups',
                    timestamp: '2024-01-15T10:30:00.000Z'
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        ClerkAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Clerk JWT token for authentication'
        }
      },
      schemas: {
        CreateBillRequest: {
          type: 'object',
          required: ['merchant_name', 'date', 'items', 'subtotal', 'total_amount', 'currency'],
          properties: {
            merchant_name: { type: 'string', example: 'GrabFood' },
            receipt_number: { type: 'string', nullable: true, example: 'A-7HHS27VWWJJQ' },
            date: { type: 'string', format: 'date', example: '2025-02-19' },
            time: { type: 'string', nullable: true, example: '12:48' },
            items: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/BillItemRequest' }
            },
            subtotal: { type: 'number', minimum: 0, example: 283000 },
            discounts: {
              type: 'array',
              items: { $ref: '#/components/schemas/DiscountRequest' },
              default: []
            },
            service_charge: { type: 'number', minimum: 0, default: 0, example: 0 },
            tax: { type: 'number', minimum: 0, default: 0, example: 0 },
            additional_fees: {
              type: 'array',
              items: { $ref: '#/components/schemas/AdditionalFeeRequest' },
              default: []
            },
            total_amount: { type: 'number', minimum: 0, example: 274500 },
            payment_method: { type: 'string', nullable: true, example: 'Visa' },
            currency: { type: 'string', example: 'IDR' }
          }
        },
        BillItemRequest: {
          type: 'object',
          required: ['name', 'quantity', 'unit_price', 'total_price'],
          properties: {
            name: { type: 'string', minLength: 1, example: 'MIE GACOAN LV 3' },
            quantity: { type: 'number', minimum: 1, example: 1 },
            unit_price: { type: 'number', minimum: 0, example: 14500 },
            total_price: { type: 'number', minimum: 0, example: 14500 },
            category: { type: 'string', nullable: true, example: 'food' }
          }
        },
        DiscountRequest: {
          type: 'object',
          required: ['name', 'amount', 'type'],
          properties: {
            name: { type: 'string', minLength: 1, example: 'Member Discount' },
            amount: { type: 'number', minimum: 0, example: 9000 },
            type: { type: 'string', enum: ['percentage', 'fixed'], example: 'fixed' }
          }
        },
        AdditionalFeeRequest: {
          type: 'object',
          required: ['name', 'amount'],
          properties: {
            name: { type: 'string', minLength: 1, example: 'Biaya Pengiriman' },
            amount: { type: 'number', minimum: 0, example: 11000 }
          }
        },
        CreateBillResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/BillResponse' },
            message: { type: 'string', example: 'Bill created successfully' }
          }
        },
        BillResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx1234567890' },
            merchant_name: { type: 'string', example: 'GrabFood' },
            receipt_number: { type: 'string', nullable: true, example: 'A-7HHS27VWWJJQ' },
            date: { type: 'string', format: 'date', example: '2025-02-19' },
            time: { type: 'string', nullable: true, example: '12:48' },
            subtotal: { type: 'number', example: 283000 },
            service_charge: { type: 'number', example: 0 },
            tax: { type: 'number', example: 0 },
            total_amount: { type: 'number', example: 274500 },
            payment_method: { type: 'string', nullable: true, example: 'Visa' },
            currency: { type: 'string', example: 'IDR' },
            created_by: { type: 'string', example: 'user_2abc123def456' },
            created_at: { type: 'string', format: 'date-time', example: '2025-02-19T12:48:00.000Z' },
            updated_at: { type: 'string', format: 'date-time', example: '2025-02-19T12:48:00.000Z' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/BillItemResponse' }
            },
            discounts: {
              type: 'array',
              items: { $ref: '#/components/schemas/DiscountResponse' }
            },
            additional_fees: {
              type: 'array',
              items: { $ref: '#/components/schemas/AdditionalFeeResponse' }
            }
          }
        },
        BillItemResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'item_1' },
            name: { type: 'string', example: 'MIE GACOAN LV 3' },
            quantity: { type: 'number', example: 1 },
            unit_price: { type: 'number', example: 14500 },
            total_price: { type: 'number', example: 14500 },
            category: { type: 'string', nullable: true, example: 'food' }
          }
        },
        DiscountResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'discount_1' },
            name: { type: 'string', example: 'Member Discount' },
            amount: { type: 'number', example: 9000 },
            type: { type: 'string', example: 'fixed' }
          }
        },
        AdditionalFeeResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'fee_1' },
            name: { type: 'string', example: 'Biaya Pengiriman' },
            amount: { type: 'number', example: 11000 }
          }
        },
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
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx1234567890' },
            username: { type: 'string', example: 'johndoe' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            image: { type: 'string', nullable: true, example: 'https://example.com/avatar1.jpg' },
          },
          required: ['id', 'username', 'name', 'email']
        },
        GetGroupsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Groups retrieved successfully' },
            data: {
              type: 'object',
              properties: {
                groups: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Group' }
                },
                pagination: { $ref: '#/components/schemas/Pagination' }
              }
            },
            timestamp: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
          }
        },
        Group: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx1234567890' },
            name: { type: 'string', example: 'McDonald\'s - 15/01/2024' },
            description: { type: 'string', nullable: true, example: 'Split bill for McDonald\'s' },
            member_count: { type: 'integer', example: 0 },
            status: { 
              type: 'string', 
              enum: ['outstanding', 'allocated'], 
              example: 'outstanding',
              description: 'outstanding = no members, allocated = has members'
            },
            created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            updated_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            members: {
              type: 'array',
              items: { $ref: '#/components/schemas/GroupMember' }
            }
          },
          required: ['id', 'name', 'member_count', 'status', 'created_at', 'updated_at', 'members']
        },
        GroupMember: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'member_1' },
            role: { type: 'string', example: 'admin', description: 'Member role in the group' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'user_1' },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john@example.com' }
              },
              required: ['id', 'name', 'email']
            }
          },
          required: ['id', 'role', 'user']
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1, description: 'Current page number' },
            limit: { type: 'integer', example: 10, description: 'Items per page' },
            total: { type: 'integer', example: 25, description: 'Total number of items' },
            hasMore: { type: 'boolean', example: true, description: 'Whether there are more pages' },
            totalPages: { type: 'integer', example: 3, description: 'Total number of pages' }
          },
          required: ['page', 'limit', 'total', 'hasMore', 'totalPages']
        }
      },
    },
  }

  return NextResponse.json(swaggerSpec)
}