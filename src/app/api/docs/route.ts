import { NextResponse } from 'next/server'

export async function GET() {
  const swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Split Bill API',
      version: '1.0.0',
      description: `
# Split Bill API Documentation

Complete REST API for managing split bill expenses, group management, and payment settlements.

## Key Features
- 🧾 **Bill Management**: Create and extract bill data using AI OCR
- 👥 **Group Management**: Create groups and manage members
- 💰 **Smart Allocation**: Allocate bill items to group members
- 📱 **WhatsApp Integration**: Auto-generate WhatsApp broadcast URLs
- 💳 **Settlement Tracking**: Track payments between members
- 🌐 **Public Sharing**: Share bill details via public URLs
- ⚡ **CloudFront Caching**: Fast public API responses

## Authentication
All protected endpoints require Clerk JWT token in Authorization header:
\`\`\`
Authorization: Bearer <clerk-jwt-token>
\`\`\`

## Rate Limits
- Authenticated: 1000 requests/hour
- Public endpoints: 100 requests/hour
- OCR extraction: 50 requests/hour

## Error Handling
All errors follow consistent format with success flag, error object, and optional debug info.
      `,
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
          description: `
## Create Bill from Extracted Data

Create a new bill record in the database from OCR-extracted or manually entered data.

### Use Cases:
- Save bill after OCR extraction
- Create bill manually for group splitting
- Store receipt data for expense tracking

### Workflow:
1. Extract bill data using \`/ocr/extract\` (optional)
2. Create bill using this endpoint
3. Create group and add members
4. Allocate bill items to members
5. Generate settlements automatically

### Important Notes:
- All monetary values in smallest currency unit (e.g., cents for USD, rupiah for IDR)
- Items array must contain at least one item
- Total amount should equal sum of subtotal + fees + tax - discounts
          `,
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
          description: `
## AI-Powered Bill Data Extraction

Upload receipt/bill images and extract structured data using Google Gemini AI.

### Supported Image Formats:
- JPEG, PNG, WebP
- Max file size: 10MB
- Min resolution: 300x300px
- Max resolution: 4096x4096px

### Extraction Capabilities:
- 🏢 **Merchant information** (name, address)
- 📅 **Date and time** of purchase
- 📝 **Itemized list** with quantities and prices
- 💰 **Totals, taxes, fees** and discounts
- 💳 **Payment method** detection

### Best Practices:
- Use clear, well-lit images
- Ensure text is readable
- Avoid blurry or rotated images
- Include full receipt in frame

### AI Agents:
- **gemini**: Google Gemini Pro (default, most accurate)
- **deepseek**: DeepSeek AI (alternative)
          `,
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
        },
        post: {
          summary: 'Create a new group',
          description: `
## Create Split Bill Group

Create a new group for splitting bills among multiple people.

### Group Lifecycle:
1. **outstanding** - Newly created, no allocations yet
2. **allocated** - Bill items allocated to members, settlements created

### Use Cases:
- Create group after bill creation
- Organize expense sharing for events
- Manage recurring group expenses

### Next Steps After Creation:
1. Add members using \`/groups/{id}/members\`
2. Allocate bill items using \`/groups/{id}/allocations\`
3. Track settlements using \`/settlements\`
          `,
          tags: ['Groups'],
          security: [{ ClerkAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateGroupRequest' }
              }
            }
          },
          responses: {
            201: {
              description: 'Group created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GroupResponse' }
                }
              }
            }
          }
        }
      },
      '/groups/{id}': {
        get: {
          summary: 'Get group by ID',
          description: 'Retrieve a specific group with its details',
          tags: ['Groups'],
          security: [{ ClerkAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Group ID'
            }
          ],
          responses: {
            200: {
              description: 'Group retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GroupResponse' }
                }
              }
            }
          }
        },
        put: {
          summary: 'Update group',
          description: 'Update group information',
          tags: ['Groups'],
          security: [{ ClerkAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Group ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateGroupRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Group updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GroupResponse' }
                }
              }
            }
          }
        }
      },
      '/groups/{id}/allocations': {
        post: {
          summary: 'Save group allocations with WhatsApp broadcast',
          description: `
## Save Allocations & Auto-Generate WhatsApp Broadcasts

Save bill item allocations to group members and automatically generate WhatsApp broadcast URLs.

### What This Endpoint Does:
1. 💾 **Save Allocations** - Store which items each member is responsible for
2. 💳 **Create Settlements** - Auto-generate payment records between members
3. 📱 **WhatsApp URLs** - Generate \`wa.me\` links with custom messages
4. 🔄 **Update Status** - Change group status to 'allocated'

### WhatsApp Integration:
- Generates personalized messages for each member
- Includes member name, group name, merchant, total amount
- Contains direct link to member's allocation page
- URLs automatically open WhatsApp app on mobile
- Works on all platforms (iOS, Android, Desktop)

### Settlement Logic:
- All members pay to group creator (receiver)
- Settlements created with 'pending' status
- Amount based on member's total allocation

### Permissions:
- Only group creator can save allocations
- Group must be in 'outstanding' status
- Cannot modify already allocated groups
          `,
          tags: ['Allocations'],
          security: [{ ClerkAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Group ID',
              example: 'clx1234567890'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SaveAllocationsRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Allocations saved successfully with WhatsApp broadcast URLs',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SaveAllocationsResponse' }
                }
              }
            },
            400: {
              description: 'Group already allocated or invalid data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            403: {
              description: 'Permission denied - only group creator can save allocations',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/dashboard': {
        get: {
          summary: 'Get dashboard data',
          description: 'Retrieve dashboard statistics and recent activities for authenticated user',
          tags: ['Dashboard'],
          security: [{ ClerkAuth: [] }],
          responses: {
            200: {
              description: 'Dashboard data retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DashboardResponse' }
                }
              }
            }
          }
        }
      },
      '/settlements': {
        get: {
          summary: 'Get user settlements',
          description: 'Retrieve settlements where user is payer or receiver',
          tags: ['Settlements'],
          security: [{ ClerkAuth: [] }],
          parameters: [
            {
              name: 'status',
              in: 'query',
              required: false,
              schema: { 
                type: 'string',
                enum: ['pending', 'paid', 'all'],
                default: 'all'
              },
              description: 'Filter settlements by status'
            },
            {
              name: 'type',
              in: 'query',
              required: false,
              schema: { 
                type: 'string',
                enum: ['payable', 'receivable', 'all'],
                default: 'all'
              },
              description: 'Filter by settlement type'
            }
          ],
          responses: {
            200: {
              description: 'Settlements retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SettlementsResponse' }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create settlement',
          description: 'Create a new settlement between users',
          tags: ['Settlements'],
          security: [{ ClerkAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateSettlementRequest' }
              }
            }
          },
          responses: {
            201: {
              description: 'Settlement created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SettlementResponse' }
                }
              }
            }
          }
        }
      },
      '/settlements/{id}': {
        get: {
          summary: 'Get settlement by ID',
          description: 'Retrieve specific settlement details',
          tags: ['Settlements'],
          security: [{ ClerkAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Settlement ID'
            }
          ],
          responses: {
            200: {
              description: 'Settlement retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SettlementResponse' }
                }
              }
            }
          }
        },
        put: {
          summary: 'Update settlement status',
          description: 'Mark settlement as paid or update details',
          tags: ['Settlements'],
          security: [{ ClerkAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Settlement ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['pending', 'paid'], example: 'paid' },
                    paidAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
                    notes: { type: 'string', example: 'Paid via bank transfer' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Settlement updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SettlementResponse' }
                }
              }
            }
          }
        }
      },
      '/settlements/{id}/status': {
        patch: {
          summary: 'Update settlement status',
          description: `
## Update Payment Status

Mark settlements as paid or pending. Only payer or receiver can update status.

### Status Flow:
1. **pending** - Payment not yet made (default)
2. **paid** - Payment completed and confirmed

### Use Cases:
- Mark payment as completed after transfer
- Revert to pending if payment failed
- Track payment confirmation between members

### Permissions:
- 👤 **Payer** can mark as paid when they send money
- 💰 **Receiver** can mark as paid when they receive money
- ❌ **Others** cannot modify settlement status

### Best Practices:
- Update status immediately after payment
- Use consistent payment methods
- Keep payment receipts for reference
- Communicate with other party before updating
          `,
          tags: ['Settlements'],
          security: [{ ClerkAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Settlement ID',
              example: 'settlement_123'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['pending', 'paid'],
                      example: 'paid',
                      description: 'New settlement status'
                    }
                  }
                },
                example: {
                  status: 'paid'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Settlement status updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'settlement_123' },
                          status: { type: 'string', example: 'paid' }
                        }
                      },
                      message: { type: 'string', example: 'Settlement status updated successfully' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid request data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: {
                      message: 'Invalid request data',
                      details: 'Status must be either pending or paid'
                    }
                  }
                }
              }
            },
            401: {
              description: 'Authentication required',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            403: {
              description: 'Permission denied - only payer or receiver can update',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: {
                      message: 'Permission denied',
                      details: 'Only payer or receiver can update settlement status'
                    }
                  }
                }
              }
            },
            404: {
              description: 'Settlement not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: {
                      message: 'Settlement not found',
                      details: 'Settlement does not exist'
                    }
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/profile': {
        get: {
          summary: 'Get user profile',
          description: 'Retrieve current user profile information',
          tags: ['Profile'],
          security: [{ ClerkAuth: [] }],
          responses: {
            200: {
              description: 'Profile retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ProfileResponse' }
                }
              }
            },
            401: {
              description: 'Authentication required',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        },
        put: {
          summary: 'Update user profile',
          description: 'Update current user profile information',
          tags: ['Profile'],
          security: [{ ClerkAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProfileRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Profile updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ProfileResponse' }
                }
              }
            },
            400: {
              description: 'Invalid profile data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            401: {
              description: 'Authentication required',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/public/bills/{groupId}': {
        get: {
          summary: 'Get public bill details',
          description: `
## Public Bill Sharing

Retrieve complete bill details for public sharing without authentication.

### Use Cases:
- Share bill summary via social media
- Allow members to view bill without login
- Generate public links for transparency
- Mobile-friendly bill viewing

### Caching Strategy:
- ⚡ **CloudFront CDN** - Global edge caching
- 💾 **S3 Cache** - Persistent storage cache
- 🔄 **Auto-Invalidation** - Cache cleared on updates
- 📊 **Cache Headers** - Monitor hit/miss rates

### Response Headers:
- \`X-Cache-Source\`: s3 | database
- \`X-Cache-Status\`: hit | miss
- \`Cache-Control\`: Browser caching rules

### Performance:
- Cached responses: <50ms
- Database fallback: <500ms
- Global CDN coverage
          `,
          tags: ['Public'],
          parameters: [
            {
              name: 'groupId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Group ID'
            }
          ],
          responses: {
            200: {
              description: 'Bill details retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PublicBillResponse' }
                }
              }
            }
          }
        }
      },
      '/public/allocations/{groupId}/{memberId}': {
        get: {
          summary: 'Get member allocation details',
          description: 'Retrieve specific member allocation details for public sharing (no authentication required)',
          tags: ['Public'],
          parameters: [
            {
              name: 'groupId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Group ID'
            },
            {
              name: 'memberId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Member ID'
            }
          ],
          responses: {
            200: {
              description: 'Member allocation retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          group: { $ref: '#/components/schemas/Group' },
                          member: {
                            type: 'object',
                            properties: {
                              memberId: { type: 'string', example: 'member_1' },
                              memberName: { type: 'string', example: 'John Doe' },
                              breakdown: {
                                type: 'object',
                                properties: {
                                  subtotal: { type: 'number', example: 90000 },
                                  total: { type: 'number', example: 90000 }
                                }
                              },
                              items: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    itemName: { type: 'string', example: 'Cappuccino' },
                                    quantity: { type: 'number', example: 2 },
                                    unitPrice: { type: 'number', example: 45000 },
                                    totalPrice: { type: 'number', example: 90000 }
                                  }
                                }
                              }
                            }
                          },
                          bill: { $ref: '#/components/schemas/BillResponse' }
                        }
                      },
                      message: { type: 'string', example: 'Member allocation retrieved successfully' }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Group, member, or allocation not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/public/groups/{groupId}': {
        get: {
          summary: 'Get public group summary',
          description: 'Retrieve group summary for public sharing (cached via CloudFront)',
          tags: ['Public'],
          parameters: [
            {
              name: 'groupId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Group ID'
            }
          ],
          responses: {
            200: {
              description: 'Group summary retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          group: { $ref: '#/components/schemas/Group' },
                          summary: {
                            type: 'object',
                            properties: {
                              totalAmount: { type: 'number', example: 500000 },
                              memberCount: { type: 'number', example: 5 },
                              status: { type: 'string', example: 'allocated' },
                              merchantName: { type: 'string', example: 'Starbucks Coffee' }
                            }
                          }
                        }
                      },
                      message: { type: 'string', example: 'Group summary retrieved successfully' }
                    }
                  },
                  headers: {
                    'X-Cache-Source': {
                      schema: { type: 'string' },
                      description: 'Cache source (s3, database)',
                      example: 's3'
                    },
                    'X-Cache-Status': {
                      schema: { type: 'string' },
                      description: 'Cache status (hit, miss)',
                      example: 'hit'
                    }
                  }
                }
              }
            },
            404: {
              description: 'Group not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/health': {
        get: {
          summary: 'Health check',
          description: 'Check API health status',
          tags: ['System'],
          responses: {
            200: {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/groups/{id}/members': {
        post: {
          summary: 'Add member to group',
          description: 'Add a new member to the group',
          tags: ['Groups'],
          security: [{ ClerkAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Group ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId'],
                  properties: {
                    userId: { type: 'string', example: 'user_123' },
                    role: { type: 'string', enum: ['member', 'admin'], default: 'member' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Member added successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/GroupMember' },
                      message: { type: 'string', example: 'Member added successfully' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/groups/{id}/settlements': {
        get: {
          summary: 'Get group settlements',
          description: 'Retrieve all settlements for a specific group',
          tags: ['Groups', 'Settlements'],
          security: [{ ClerkAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Group ID'
            }
          ],
          responses: {
            200: {
              description: 'Group settlements retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SettlementsResponse' }
                }
              }
            }
          }
        }
      },
      '/settlements/bills-to-pay': {
        get: {
          summary: 'Get bills to pay',
          description: 'Retrieve pending settlements where current user is the payer',
          tags: ['Settlements'],
          security: [{ ClerkAuth: [] }],
          responses: {
            200: {
              description: 'Bills to pay retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'settlement_123' },
                            amount: { type: 'number', example: 45000 },
                            receiver: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', example: 'John Doe' },
                                email: { type: 'string', example: 'john@example.com' }
                              }
                            },
                            group: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', example: 'Starbucks Dinner' }
                              }
                            },
                            createdAt: { type: 'string', format: 'date-time' }
                          }
                        }
                      },
                      message: { type: 'string', example: 'Bills to pay retrieved successfully' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/user/profile': {
        get: {
          summary: 'Get user profile (alternative endpoint)',
          description: 'Retrieve current user profile information',
          tags: ['Profile'],
          security: [{ ClerkAuth: [] }],
          responses: {
            200: {
              description: 'Profile retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ProfileResponse' }
                }
              }
            }
          }
        },
        put: {
          summary: 'Update user profile (alternative endpoint)',
          description: 'Update current user profile information',
          tags: ['Profile'],
          security: [{ ClerkAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProfileRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Profile updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ProfileResponse' }
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
        },
        SaveAllocationsRequest: {
          type: 'object',
          required: ['allocations'],
          properties: {
            allocations: {
              type: 'array',
              items: { $ref: '#/components/schemas/MemberAllocation' }
            },
            billId: { type: 'string', example: 'bill_123' }
          }
        },
        MemberAllocation: {
          type: 'object',
          required: ['memberId', 'memberName', 'items', 'breakdown'],
          properties: {
            memberId: { type: 'string', example: 'member_1' },
            memberName: { type: 'string', example: 'John Doe' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  itemId: { type: 'string', example: 'item_1' },
                  itemName: { type: 'string', example: 'Cappuccino' },
                  quantity: { type: 'number', example: 2 },
                  unitPrice: { type: 'number', example: 45000 },
                  totalPrice: { type: 'number', example: 90000 }
                }
              }
            },
            breakdown: {
              type: 'object',
              properties: {
                subtotal: { type: 'number', example: 90000 },
                discount: { type: 'number', example: 0 },
                tax: { type: 'number', example: 0 },
                serviceCharge: { type: 'number', example: 0 },
                additionalFees: { type: 'number', example: 0 },
                total: { type: 'number', example: 90000 }
              }
            }
          }
        },
        SaveAllocationsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                groupId: { type: 'string', example: 'clx1234567890' },
                saved: { type: 'boolean', example: true },
                settlementsCreated: { type: 'number', example: 2 },
                allocationsCount: { type: 'number', example: 3 },
                whatsappBroadcasts: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/WhatsAppBroadcast' }
                },
                broadcastCount: { type: 'number', example: 1 }
              }
            },
            message: { type: 'string', example: 'Allocations saved successfully. WhatsApp broadcast URLs generated.' }
          }
        },
        WhatsAppBroadcast: {
          type: 'object',
          properties: {
            memberId: { type: 'string', example: 'member_1' },
            memberName: { type: 'string', example: 'John Doe' },
            phone: { type: 'string', example: '+628123456789' },
            whatsappUrl: { type: 'string', example: 'https://wa.me/628123456789?text=Hi%20John...' },
            totalAmount: { type: 'number', example: 90000 }
          }
        },
        DashboardResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                stats: {
                  type: 'object',
                  properties: {
                    totalGroups: { type: 'number', example: 5 },
                    outstandingGroups: { type: 'number', example: 2 },
                    allocatedGroups: { type: 'number', example: 3 },
                    totalAmount: { type: 'number', example: 500000 },
                    pendingAmount: { type: 'number', example: 150000 },
                    paidAmount: { type: 'number', example: 350000 }
                  }
                },
                recentActivities: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'activity_1' },
                      type: { type: 'string', example: 'bill_allocated' },
                      title: { type: 'string', example: 'Bill Allocated' },
                      description: { type: 'string', example: 'Starbucks Coffee' },
                      amount: { type: 'number', example: 90000 },
                      createdAt: { type: 'string', format: 'date-time' }
                    }
                  }
                },
                billsToPay: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'settlement_1' },
                      merchantName: { type: 'string', example: 'Payment to John Doe' },
                      amount: { type: 'number', example: 45000 },
                      status: { type: 'string', example: 'pending' },
                      billDate: { type: 'string', example: '2024-01-15' }
                    }
                  }
                }
              }
            },
            message: { type: 'string', example: 'Dashboard data retrieved successfully' }
          }
        },
        PublicBillResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                group: { $ref: '#/components/schemas/Group' },
                bill: { $ref: '#/components/schemas/BillResponse' },
                members: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/GroupMember' }
                }
              }
            },
            message: { type: 'string', example: 'Bill details retrieved successfully' }
          }
        },
        ProfileResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'user_123' },
                clerkId: { type: 'string', example: 'user_2abc123def456' },
                name: { type: 'string', example: 'John Doe' },
                username: { type: 'string', example: 'johndoe' },
                email: { type: 'string', example: 'john@example.com' },
                phone: { type: 'string', nullable: true, example: '+628123456789' },
                image: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
                createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
                updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
              }
            },
            message: { type: 'string', example: 'Profile retrieved successfully' }
          }
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Doe', description: 'Full name' },
            username: { type: 'string', example: 'johndoe', description: 'Unique username' },
            phone: { type: 'string', nullable: true, example: '+628123456789', description: 'Phone number for WhatsApp notifications' },
            image: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg', description: 'Profile image URL' }
          }
        },
        CreateGroupRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'McDonald\'s Dinner', description: 'Group name' },
            description: { type: 'string', nullable: true, example: 'Split bill for McDonald\'s dinner', description: 'Group description' },
            billId: { type: 'string', nullable: true, example: 'bill_123', description: 'Associated bill ID' }
          }
        },
        UpdateGroupRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'McDonald\'s Dinner Updated', description: 'Group name' },
            description: { type: 'string', nullable: true, example: 'Updated description', description: 'Group description' }
          }
        },
        GroupResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/Group' },
            message: { type: 'string', example: 'Group retrieved successfully' }
          }
        },
        Settlement: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'settlement_123' },
            groupId: { type: 'string', example: 'group_123' },
            payerId: { type: 'string', example: 'user_123' },
            receiverId: { type: 'string', example: 'user_456' },
            amount: { type: 'number', example: 45000 },
            currency: { type: 'string', example: 'IDR' },
            status: { type: 'string', enum: ['pending', 'paid'], example: 'pending' },
            notes: { type: 'string', nullable: true, example: 'Payment for dinner' },
            paidAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            payer: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'user_123' },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john@example.com' }
              }
            },
            receiver: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'user_456' },
                name: { type: 'string', example: 'Jane Smith' },
                email: { type: 'string', example: 'jane@example.com' }
              }
            },
            group: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'group_123' },
                name: { type: 'string', example: 'Starbucks Dinner' }
              }
            }
          }
        },
        SettlementsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                settlements: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Settlement' }
                },
                summary: {
                  type: 'object',
                  properties: {
                    totalPayable: { type: 'number', example: 150000 },
                    totalReceivable: { type: 'number', example: 75000 },
                    pendingPayments: { type: 'number', example: 3 },
                    completedPayments: { type: 'number', example: 5 }
                  }
                }
              }
            },
            message: { type: 'string', example: 'Settlements retrieved successfully' }
          }
        },
        SettlementResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/Settlement' },
            message: { type: 'string', example: 'Settlement retrieved successfully' }
          }
        },
        CreateSettlementRequest: {
          type: 'object',
          required: ['groupId', 'receiverId', 'amount'],
          properties: {
            groupId: { type: 'string', example: 'group_123' },
            receiverId: { type: 'string', example: 'user_456' },
            amount: { type: 'number', minimum: 0, example: 45000 },
            currency: { type: 'string', default: 'IDR', example: 'IDR' },
            notes: { type: 'string', nullable: true, example: 'Payment for dinner' }
          }
        }
      },
    },
  }

  return NextResponse.json(swaggerSpec)
}