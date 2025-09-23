# 🔌 API Overview - Split Bill Application

This document provides a comprehensive overview of the Split Bill Application API architecture, conventions, and usage patterns.

## 📋 API Architecture

### RESTful Design
The Split Bill API follows RESTful principles with consistent HTTP methods and status codes.

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://split-bill-mu.vercel.app/api`

### Authentication
All protected endpoints require authentication via Clerk JWT tokens.

## 🔐 Authentication

### Authentication Flow
```typescript
// Client-side authentication check
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }
  // ... protected logic
}
```

### Headers
```http
Authorization: Bearer <clerk-jwt-token>
Content-Type: application/json
```

## 📊 Response Format

### Success Response
```typescript
interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}
```

### Error Response
```typescript
interface ApiErrorResponse {
  success: false
  error: {
    message: string      // User-friendly message
    details?: string     // Technical details
  }
  debug?: {
    timestamp: string
    endpoint: string
    stack?: string
  }
}
```

### Example Responses
```json
// Success
{
  "success": true,
  "data": {
    "id": "group-123",
    "name": "Weekend Trip",
    "memberCount": 4
  },
  "message": "Group retrieved successfully"
}

// Error
{
  "success": false,
  "error": {
    "message": "Group not found",
    "details": "No group found with ID: group-123"
  },
  "debug": {
    "timestamp": "2024-01-15T10:30:00Z",
    "endpoint": "/api/groups/group-123"
  }
}
```

## 🏷️ HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST requests |
| 400 | Bad Request | Invalid request data or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists or conflict |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server-side errors |

## 📚 API Endpoints Overview

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/user` | Get current user info | ✅ |
| POST | `/api/auth/sync` | Sync Clerk user to database | ✅ |

### Groups API
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/groups` | List user's groups | ✅ |
| POST | `/api/groups` | Create new group | ✅ |
| GET | `/api/groups/[id]` | Get group details | ✅ |
| PUT | `/api/groups/[id]` | Update group | ✅ |
| DELETE | `/api/groups/[id]` | Delete group | ✅ |
| GET | `/api/groups/[id]/members` | Get group members | ✅ |
| POST | `/api/groups/[id]/members` | Add member to group | ✅ |
| DELETE | `/api/groups/[id]/members/[userId]` | Remove member | ✅ |

### Expenses API
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/groups/[id]/expenses` | List group expenses | ✅ |
| POST | `/api/groups/[id]/expenses` | Create new expense | ✅ |
| GET | `/api/expenses/[id]` | Get expense details | ✅ |
| PUT | `/api/expenses/[id]` | Update expense | ✅ |
| DELETE | `/api/expenses/[id]` | Delete expense | ✅ |

### Settlements API
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/groups/[id]/settlements` | Get group settlements | ✅ |
| POST | `/api/settlements` | Record payment | ✅ |
| PATCH | `/api/settlements/[id]/status` | Update payment status | ✅ |

### OCR API
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ocr/extract` | Extract text from receipt | ✅ |

### Public API (Cached)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/public/bills/[groupId]` | Get public bill summary | ❌ |
| GET | `/api/public/allocations/[groupId]/[memberId]` | Get member allocation | ❌ |

### Utility Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | ❌ |
| GET | `/api/docs` | API documentation | ❌ |

## 🔍 Query Parameters

### Pagination
```http
GET /api/groups?page=1&limit=10
```

### Filtering
```http
GET /api/groups?status=active&search=weekend
```

### Sorting
```http
GET /api/expenses?sort=date&order=desc
```

### Common Parameters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number for pagination | 1 |
| `limit` | number | Items per page | 10 |
| `sort` | string | Sort field | `createdAt` |
| `order` | string | Sort order (`asc`, `desc`) | `desc` |
| `search` | string | Search query | - |
| `status` | string | Filter by status | - |

## 📝 Request/Response Examples

### Create Group
```http
POST /api/groups
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Weekend Trip",
  "description": "Expenses for our weekend getaway",
  "currency": "USD"
}
```

```json
{
  "success": true,
  "data": {
    "id": "group-123",
    "name": "Weekend Trip",
    "description": "Expenses for our weekend getaway",
    "currency": "USD",
    "createdBy": "user-456",
    "memberCount": 1,
    "totalExpenses": 0,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Group created successfully"
}
```

### Add Expense
```http
POST /api/groups/group-123/expenses
Content-Type: application/json
Authorization: Bearer <token>

{
  "description": "Dinner at restaurant",
  "amount": 120.50,
  "category": "food",
  "date": "2024-01-15",
  "receiptUrl": "https://s3.amazonaws.com/receipts/receipt-123.jpg",
  "splitType": "equal",
  "participants": ["user-456", "user-789"]
}
```

### Get Settlements
```http
GET /api/groups/group-123/settlements
Authorization: Bearer <token>
```

```json
{
  "success": true,
  "data": {
    "settlements": [
      {
        "id": "settlement-123",
        "payerId": "user-456",
        "receiverId": "user-789",
        "amount": 60.25,
        "status": "pending",
        "description": "Share of dinner expenses",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "summary": {
      "totalSettlements": 1,
      "pendingAmount": 60.25,
      "completedAmount": 0
    }
  }
}
```

## ⚡ Caching Strategy

### Public API Caching
Public endpoints are cached using CloudFront + S3:

```http
GET /api/public/bills/group-123
X-Cache-Source: cloudfront
X-Cache-Status: hit
Cache-Control: public, max-age=3600
```

### Cache Headers
- `X-Cache-Source`: `cloudfront`, `s3`, or `database`
- `X-Cache-Status`: `hit`, `miss`, or `stale`
- `Cache-Control`: Standard HTTP cache control

### Cache Invalidation
Cache is automatically invalidated when:
- Group data is updated
- Expenses are added/modified
- Settlements are recorded

## 🔒 Security

### Input Validation
All endpoints use Zod schemas for validation:

```typescript
import { z } from 'zod'

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  currency: z.string().length(3).default('USD')
})
```

### Rate Limiting
- **Authenticated endpoints**: 100 requests/minute per user
- **Public endpoints**: 1000 requests/minute per IP
- **OCR endpoints**: 10 requests/minute per user

### CORS Configuration
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://split-bill-mu.vercel.app' 
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}
```

## 📊 Error Handling

### Validation Errors
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": "Name is required and must be at least 1 character"
  },
  "validationErrors": [
    {
      "field": "name",
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

### Database Errors
```json
{
  "success": false,
  "error": {
    "message": "Database operation failed",
    "details": "Unable to connect to database"
  },
  "debug": {
    "timestamp": "2024-01-15T10:30:00Z",
    "endpoint": "/api/groups",
    "error": "Connection timeout"
  }
}
```

## 🧪 Testing

### API Testing
```bash
# Health check
curl https://split-bill-mu.vercel.app/api/health

# Get groups (requires auth)
curl -H "Authorization: Bearer <token>" \
     https://split-bill-mu.vercel.app/api/groups

# Test public API
curl https://split-bill-mu.vercel.app/api/public/bills/group-123
```

### Integration Tests
```typescript
import { testApiHandler } from 'next-test-api-route-handler'
import handler from '@/app/api/groups/route'

describe('/api/groups', () => {
  it('should create group successfully', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          body: JSON.stringify({
            name: 'Test Group',
            description: 'Test description'
          })
        })
        
        expect(res.status).toBe(201)
        const data = await res.json()
        expect(data.success).toBe(true)
      }
    })
  })
})
```

## 📚 SDK and Client Libraries

### TypeScript Client
```typescript
import { SplitBillClient } from '@/shared/api/client'

const client = new SplitBillClient({
  baseUrl: 'https://split-bill-mu.vercel.app/api',
  auth: () => getAuthToken()
})

// Usage
const groups = await client.groups.list()
const group = await client.groups.create({
  name: 'Weekend Trip',
  description: 'Our weekend expenses'
})
```

### React Hooks
```typescript
import { useGroups, useCreateGroup } from '@/entities/group'

function GroupList() {
  const { data: groups, isLoading } = useGroups()
  const createGroup = useCreateGroup()
  
  const handleCreate = (data) => {
    createGroup.mutate(data)
  }
  
  // ... component logic
}
```

## 🔄 Versioning

### API Versioning Strategy
- **Current Version**: v1 (implicit)
- **Future Versions**: `/api/v2/...` when breaking changes needed
- **Backward Compatibility**: Maintain v1 for existing clients

### Deprecation Policy
- **Notice Period**: 6 months before deprecation
- **Migration Guide**: Provided for breaking changes
- **Support**: Legacy versions supported for 1 year

---

**For detailed endpoint documentation, visit the [Live API Documentation](https://split-bill-mu.vercel.app/api/docs).**