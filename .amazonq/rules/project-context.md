# Split Bill Application - Amazon Q Rules

## Project Context
Full-stack split bill management application for tracking shared expenses and calculating splits among friends/groups.

## Tech Stack
- **Framework**: Next.js 15 + TypeScript
- **Database**: MongoDB Atlas + Prisma ORM  
- **Auth**: Clerk (Email, Google, GitHub OAuth)
- **UI**: shadcn/ui + Tailwind CSS
- **CDN**: AWS CloudFront + S3 caching
- **Deployment**: Vercel

## Current Implementation Status 🚧

### CloudFront Caching (Production Ready)
- **S3 Bucket**: `split-bill-cache` (ap-southeast-1)
- **CloudFront Distribution**: `<distribution-id>`
- **Domain**: `https://<cloudfront-domain>.cloudfront.net`
- **Cache Strategy**: S3 + CloudFront hybrid with auto-invalidation
- **Public API**: `/api/public/groups/[id]` - cached group summaries
- **Cache Headers**: `X-Cache-Source`, `X-Cache-Status` for monitoring

### Core Features (In Development)
- **User Management**: Clerk authentication with multiple providers
- **Group Management**: Create and manage expense groups
- **Expense Tracking**: Add, edit, delete shared expenses
- **Split Calculation**: Automatic calculation of who owes what
- **Settlement**: Track payments between group members
- **Dashboard**: Overview of all groups and balances

### Key Files & Structure
```
src/
├── app/
│   ├── (auth)/                         # Auth pages (sign-in, sign-up)
│   ├── dashboard/                      # Main dashboard
│   ├── groups/                         # Group management
│   ├── expenses/                       # Expense management
│   └── api/
│       ├── public/groups/[id]/route.ts # Cached public group API
│       ├── groups/                     # Group CRUD operations
│       ├── expenses/                   # Expense CRUD operations
│       ├── settlements/                # Settlement tracking
│       └── files/route.ts              # File upload API
├── entities/
│   ├── user/                          # User entity
│   ├── group/                         # Group entity
│   └── expense/                       # Expense entity
├── features/
│   ├── auth/                          # Authentication features
│   ├── group-management/              # Group creation/management
│   ├── expense-tracking/              # Expense CRUD
│   └── settlement/                    # Payment tracking
├── widgets/
│   ├── dashboard/                     # Dashboard widgets
│   ├── group-list/                    # Group listing
│   └── expense-summary/               # Expense summaries
└── shared/
    ├── lib/
    │   ├── prisma.ts                  # Database client
    │   ├── clerk.ts                   # Clerk utilities
    │   ├── calculations.ts            # Split calculations
    │   ├── s3.ts                      # S3 operations + invalidation
    │   ├── cloudfront.ts              # CloudFront utilities
    │   └── cache-sync.ts              # Cache synchronization
    ├── components/ui/                 # shadcn/ui components
    └── types/                         # TypeScript types
```

### Environment Variables
```env
# Database
DATABASE_URL="mongodb+srv://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# AWS Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="ap-southeast-1"
S3_BUCKET_NAME="split-bill-cache"
CLOUDFRONT_DISTRIBUTION_ID="<distribution-id>"
NEXT_PUBLIC_CLOUDFRONT_URL="https://<cloudfront-domain>.cloudfront.net"
```

## Development Guidelines

### When Adding Features
1. **Authentication**: Use Clerk middleware for protected routes
2. **Data Validation**: Use Zod schemas for all API inputs
3. **Error Handling**: Implement proper error boundaries and API error responses
4. **Type Safety**: Maintain strict TypeScript types for all entities
5. **Cache Sync**: Always sync to S3 cache on group/expense CRUD operations
6. **Headers**: Add cache status headers for debugging

### Data Flow
1. **User Authentication** → Clerk handles auth state
2. **Group Creation** → User creates group → Invites members
3. **Expense Addition** → Add expense → Calculate splits → Update balances
4. **Settlement** → Record payments → Update member balances

### Core Entities
- **User**: Clerk user with additional profile data
- **Group**: Collection of users sharing expenses
- **Expense**: Individual expense with split information
- **Settlement**: Payment records between users

### Cache Flow
1. **Public API Request** → Check S3 cache first
2. **Cache Hit** → Serve from CloudFront (fast)
3. **Cache Miss** → Query database → Cache to S3 → Serve response
4. **CRUD Operations** → Update database → Sync to cache → Invalidate CloudFront

### Testing Commands
```bash
# Test group summary (with cache headers)
curl -I /api/public/groups/group-id

# Direct CloudFront access
curl https://<cloudfront-domain>.cloudfront.net/public/groups/group-id.json
```

## Architecture Patterns
- **FSD Structure**: Feature-Sliced Design architecture
- **Server Components**: Default for data fetching
- **Client Components**: Only when needed for interactivity
- **Optimistic Updates**: UI updates before API confirmation
- **Real-time Calculations**: Automatic split calculations on expense changes
- **Cache-First**: Always try cache before database for public APIs
- **Auto-Sync**: CRUD operations automatically update cache
- **Graceful Degradation**: Cache failures don't break functionality