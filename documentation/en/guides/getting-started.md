# 🚀 Getting Started with Split Bill Application

This guide will help you set up and run the Split Bill Application locally and understand the project structure.

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ or **Bun** (recommended)
- **Git** for version control
- **PostgreSQL** database (local or cloud)

### Required Services
1. **Clerk Account** - For authentication
2. **Google Cloud Platform** - For OCR functionality
3. **AWS Account** - For S3 storage and CloudFront CDN
4. **Database** - PostgreSQL (Neon, Supabase, or local)

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone https://github.com/pradiktabagus/split-bill.git
cd split-bill
```

### 2. Install Dependencies
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/split-bill"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Google Cloud Vision API
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"

# AWS Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="ap-southeast-1"
S3_BUCKET_NAME="split-bill-cache"
CLOUDFRONT_DISTRIBUTION_ID="your-cloudfront-distribution-id"
NEXT_PUBLIC_CLOUDFRONT_URL="https://your-domain.cloudfront.net"
```

### 4. Database Setup
```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# (Optional) Open Prisma Studio
bun run db:studio
```

### 5. Start Development Server
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

### FSD Architecture
```
split-bill/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (private)/         # Protected pages
│   │   ├── public/            # Public pages
│   │   └── api/               # API routes
│   ├── entities/              # Business entities
│   │   ├── user/              # User entity
│   │   ├── group/             # Group entity
│   │   ├── expense/           # Expense entity
│   │   └── settlement/        # Settlement entity
│   ├── features/              # Business features
│   │   ├── auth/              # Authentication features
│   │   ├── group-management/  # Group management
│   │   ├── expense-tracking/  # Expense tracking
│   │   └── settlement/        # Settlement management
│   ├── widgets/               # UI widgets
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── group-list/        # Group listing
│   │   └── expense-summary/   # Expense summaries
│   └── shared/                # Shared utilities
│       ├── api/               # API utilities
│       ├── components/ui/     # shadcn/ui components
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # Utilities
│       └── types/             # TypeScript types
├── prisma/                    # Database schema
├── public/                    # Static assets
└── documentation/             # Project documentation
```

### Key Directories

#### `/src/app/`
Next.js App Router with route groups:
- `(auth)/` - Sign in/up pages
- `(private)/` - Protected dashboard pages
- `public/` - Public bill sharing pages
- `api/` - API endpoints

#### `/src/entities/`
Business entities with their own models and APIs:
- `user/` - User management
- `group/` - Group operations
- `expense/` - Expense handling
- `settlement/` - Payment tracking

#### `/src/features/`
Business features that use entities:
- `auth/` - Authentication flows
- `group-management/` - Group CRUD operations
- `expense-tracking/` - Expense management
- `settlement/` - Payment settlement

#### `/src/widgets/`
Complex UI components:
- `dashboard/` - Main dashboard
- `group-list/` - Group listing widget
- `expense-summary/` - Expense summary widget

#### `/src/shared/`
Shared utilities and components:
- `api/` - API client and contracts
- `components/ui/` - shadcn/ui components
- `lib/` - Utility functions
- `types/` - TypeScript type definitions

## 🔧 Configuration

### Clerk Setup
1. Create account at [Clerk](https://clerk.com)
2. Create new application
3. Configure OAuth providers (Google, GitHub)
4. Set redirect URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

### Google Cloud Vision API
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Vision API
3. Create service account
4. Download service account key
5. Extract credentials to environment variables

### AWS Setup
1. Create S3 bucket for file storage
2. Create CloudFront distribution
3. Set up IAM user with appropriate permissions
4. Configure environment variables

### Database Options

#### Option 1: Neon (Recommended)
1. Create account at [Neon](https://neon.tech)
2. Create new database
3. Copy connection string to `DATABASE_URL`

#### Option 2: Supabase
1. Create account at [Supabase](https://supabase.com)
2. Create new project
3. Get database URL from settings

#### Option 3: Local PostgreSQL
1. Install PostgreSQL locally
2. Create database: `createdb split-bill`
3. Use: `postgresql://username:password@localhost:5432/split-bill`

## 🧪 Testing the Setup

### 1. Authentication Test
1. Navigate to `/sign-in`
2. Sign in with configured provider
3. Should redirect to `/dashboard`

### 2. Database Test
```bash
# Check database connection
bun run db:studio
```

### 3. OCR Test
1. Create a group
2. Add an expense
3. Upload a receipt image
4. Verify OCR extraction works

### 4. API Test
```bash
# Test API endpoints
curl http://localhost:3000/api/health
```

## 🚀 Available Scripts

```bash
# Development
bun dev              # Start development server
bun build            # Build for production
bun start            # Start production server

# Database
bun run db:generate  # Generate Prisma client
bun run db:push      # Push schema to database
bun run db:studio    # Open Prisma Studio
bun run db:migrate   # Run database migrations

# Code Quality
bun run lint         # Run ESLint
bun run type-check   # Run TypeScript check

# Testing
bun test             # Run tests
bun test:watch       # Run tests in watch mode
```

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check database server is running
- Ensure database exists

#### Clerk Authentication Error
- Verify Clerk keys are correct
- Check redirect URLs match configuration
- Ensure domain is added to Clerk dashboard

#### OCR Not Working
- Verify Google Cloud credentials
- Check Vision API is enabled
- Ensure service account has proper permissions

#### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && bun install`
- Check TypeScript errors: `bun run type-check`

### Getting Help
- Check [GitHub Issues](https://github.com/pradiktabagus/split-bill/issues)
- Review [API Documentation](https://split-bill-mu.vercel.app/api/docs)
- Join [GitHub Discussions](https://github.com/pradiktabagus/split-bill/discussions)

## 🎯 Next Steps

1. **Explore the Application**
   - Create your first group
   - Add some expenses
   - Try the OCR feature
   - Test settlement calculations

2. **Read the Documentation**
   - [FSD Architecture](../architecture/fsd-architecture.md)
   - [Core Features](../features/core-features.md)
   - [API Reference](../api/overview.md)

3. **Start Contributing**
   - Read [Contributing Guidelines](../../../CONTRIBUTING.md)
   - Check [Open Issues](https://github.com/pradiktabagus/split-bill/issues)
   - Review [Development Guidelines](./adding-features.md)

---

**Welcome to Split Bill Application development! 🎉**