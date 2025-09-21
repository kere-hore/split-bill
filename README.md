
<img width="1200" height="720" alt="Screenshot from 2025-09-21 15-31-10" src="https://github.com/user-attachments/assets/a594ebd8-74d0-4e5d-afb3-a4661885ebda" />
<img width="1200" height="720" alt="Screenshot from 2025-09-21 15-32-00" src="https://github.com/user-attachments/assets/03b75446-2a2e-470c-844d-f43b4b4077cb" />

# 💰 Split Bill - Expense Tracker

A modern, full-stack split bill management application built with Next.js, TypeScript, and PostgreSQL. Track shared expenses and calculate splits among friends and groups with real-time updates.

## ✨ Features

- 🔐 **Authentication**: Clerk with Email, Google & GitHub OAuth
- 👥 **Group Management**: Create and manage expense groups with member invitations
- 💸 **Expense Tracking**: Add, edit, delete shared expenses with receipt upload
- 📷 **OCR Receipt Scanning**: Google Vision API for automatic expense extraction
- 🧮 **Smart Splitting**: Automatic calculation of who owes what with custom allocations
- 💳 **Settlement Tracking**: Record payments between group members
- 📱 **WhatsApp Integration**: Broadcast allocation summaries via WhatsApp
- 🌐 **Public Bill Sharing**: Share expense summaries with public URLs
- 📊 **Dashboard**: Overview of all groups and balances
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS
- 🌙 **Dark Mode**: Full theme switching support
- 📱 **Responsive**: Mobile-first design
- 🔄 **Real-time**: Optimistic UI updates
- 🛡️ **Type Safe**: Full TypeScript coverage
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- 📚 **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- ☁️ **CloudFront CDN**: Global edge caching for public APIs
- 🚀 **S3 Integration**: File storage and cache management
- ⚡ **Auto-Invalidation**: Instant cache updates on data changes

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.6
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Clerk
- **OCR**: Google Cloud Vision API
- **Messaging**: WhatsApp URL generation
- **UI**: shadcn/ui + Tailwind CSS
- **Package Manager**: Bun
- **Deployment**: Vercel
- **CDN**: AWS CloudFront
- **Storage**: AWS S3
- **Cache**: CloudFront + S3 hybrid caching

## 📋 Prerequisites

### Required Services
1. **PostgreSQL Database** - Database hosting (Neon, Supabase, or local)
2. **Clerk Account** - Authentication service
3. **Google Cloud Platform** - Vision API for OCR
4. **Vercel Account** - Deployment platform
5. **AWS Account** - S3 storage and CloudFront CDN
6. **AWS S3 Bucket** - File storage and caching
7. **AWS CloudFront Distribution** - Global CDN

### Development Tools
- Node.js 18+ or Bun
- Git

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/pradiktabagus/split-bill.git
cd split-bill
```

### 2. Install Dependencies
```bash
bun install
# or
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
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

# Cache Configuration (in seconds)
BROWSER_CACHE_SECONDS=300      # Browser cache: 5 minutes
CLOUDFRONT_CACHE_SECONDS=3600  # CloudFront cache: 1 hour
```

### 4. Database Setup
```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push
```

### 5. Run Development Server
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 Configuration Files

### Core Configuration
- **`package.json`** - Dependencies, scripts, and project metadata
- **`tsconfig.json`** - TypeScript compiler configuration
- **`next.config.ts`** - Next.js framework configuration
- **`tailwind.config.ts`** - Tailwind CSS styling configuration
- **`prisma/schema.prisma`** - Database schema and ORM configuration

### UI & Components
- **`components.json`** - shadcn/ui component library configuration
  - Defines component paths and aliases
  - Sets up Tailwind integration
  - Configures icon library (Lucide)

### Deployment & Infrastructure
- **`vercel.json`** - Vercel deployment configuration
  - Sets API function timeout (30s)
  - Optimizes serverless function performance
- **`aws-iam-policy.json`** - AWS IAM permissions template
  - S3 bucket access (read/write/delete)
  - CloudFront invalidation permissions
  - Use this to create IAM policy in AWS Console

### Environment Files
- **`.env.local`** - Local development environment variables
- **`.env.example`** - Template for required environment variables
- **`.gitignore`** - Files and folders excluded from Git

### Development Tools
- **`.eslintrc.json`** - Code linting rules and configuration
- **`bun.lockb`** - Dependency lock file for Bun package manager

## 🔧 Setup Guide

### PostgreSQL Database Setup
1. **Option 1 - Neon (Recommended)**:
   - Create account at [Neon](https://neon.tech/)
   - Create new database
   - Copy connection string to `DATABASE_URL`

2. **Option 2 - Supabase**:
   - Create account at [Supabase](https://supabase.com/)
   - Create new project
   - Get database URL from settings

3. **Option 3 - Local PostgreSQL**:
   - Install PostgreSQL locally
   - Create database: `createdb split-bill`
   - Use: `postgresql://username:password@localhost:5432/split-bill`

### Clerk Setup
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create new application
3. Choose authentication methods:
   - Email/Password
   - Google OAuth
   - GitHub OAuth
4. Configure redirect URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`
5. Copy API keys to `.env.local`

### Google Cloud Vision API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Enable Vision API
4. Create service account with Vision API permissions
5. Download service account JSON key
6. Extract credentials to environment variables

### AWS Setup
1. Create AWS account and get access keys
2. Create S3 bucket for file storage
3. Create CloudFront distribution pointing to your API
4. Set up IAM permissions for S3 and CloudFront access
5. Configure CloudFront to cache `/api/public/*` paths

## 📦 Available Scripts

```bash
# Development
bun dev              # Start development server
bun build            # Build for production
bun start            # Start production server

# Database
bun run db:generate  # Generate Prisma client
bun run db:push      # Push schema to database
bun run db:studio    # Open Prisma Studio

# Deployment
bun run deploy       # Deploy to Vercel
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**:
   ```bash
   bun add -g vercel
   ```

2. **Login and Deploy**:
   ```bash
   vercel login
   vercel --prod
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   vercel env add CLERK_SECRET_KEY
   vercel env add GOOGLE_CLOUD_PROJECT_ID
   vercel env add GOOGLE_CLOUD_PRIVATE_KEY
   vercel env add GOOGLE_CLOUD_CLIENT_EMAIL
   vercel env add AWS_ACCESS_KEY_ID
   vercel env add AWS_SECRET_ACCESS_KEY
   vercel env add S3_BUCKET_NAME
   vercel env add CLOUDFRONT_DISTRIBUTION_ID
   ```

4. **Update OAuth Callback URLs** with your Vercel domain

### Auto-Deploy Setup
Connect your GitHub repository to Vercel for automatic deployments on every push to main branch.

## 🎯 Usage

### Managing Split Bills
1. Login with Email, Google, or GitHub
2. Create a new group for shared expenses
3. Invite members to the group via email or username
4. Add expenses by:
   - Manual entry with description and amount
   - Upload receipt image for OCR scanning
   - System extracts expense details automatically
5. Configure expense allocation (equal split or custom amounts)
6. Save allocations and generate WhatsApp broadcast messages
7. Track settlements and payment status between members
8. Share public bill summaries with group members
9. View dashboard for overview of all groups and balances

### API Endpoints
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create new group
- `PUT /api/groups/[id]` - Update group
- `DELETE /api/groups/[id]` - Delete group
- `GET /api/groups/[id]/bills` - Get group bills
- `POST /api/groups/[id]/bills` - Create new bill
- `GET /api/groups/[id]/allocations` - Get allocations
- `POST /api/groups/[id]/allocations` - Save allocations with WhatsApp broadcast
- `POST /api/ocr` - Process receipt image with OCR
- `GET /api/settlements` - List settlements
- `POST /api/settlements` - Record payment
- `PATCH /api/settlements/[id]/status` - Update payment status
- `GET /api/public/bills/[groupId]` - Get public bill summary (cached)
- `GET /api/public/allocations/[groupId]/[memberId]` - Get member allocations (cached)
- `GET /api/docs` - Swagger API documentation

### Caching Strategy
- **Public API**: Cached via CloudFront + S3 hybrid
- **Auto-Invalidation**: Cache cleared on bill/allocation updates
- **Cache Headers**: Configurable via environment variables
- **Monitoring**: CloudFront hit/miss tracking in response headers
- **OCR Results**: Cached in S3 for performance
- **Static Assets**: Optimized delivery via CloudFront

## 🔒 Security Features

- ✅ Authentication required for all operations
- ✅ CSRF protection via Clerk
- ✅ Input validation with Zod schemas
- ✅ Type-safe database operations
- ✅ Environment variable security
- ✅ AWS IAM permissions for S3/CloudFront
- ✅ Google Cloud service account security
- ✅ Public API rate limiting via CloudFront
- ✅ Secure file uploads to S3
- ✅ OCR data sanitization
- ✅ Group member access control
- ✅ Public URL access restrictions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow Feature-Sliced Design (FSD) architecture
4. Add comprehensive API documentation
5. Include tests for new features
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the [Issues](https://github.com/pradiktabagus/split-bill/issues) page
2. Review the comprehensive API documentation at `/api/docs`
3. Check troubleshooting guide in project rules
4. Create a new issue with detailed description
5. Include error logs and environment details

## 🎉 Demo

Live demo: [https://split-bill-mu.vercel.app](https://split-bill-mu.vercel.app)

## 🎯 Key Features Highlights

### 📷 OCR Receipt Scanning
- Upload receipt images (JPEG, PNG, WebP)
- Automatic text extraction using Google Vision API
- Smart parsing of merchant, amount, and date
- Fallback to manual entry if OCR fails
- Support for various receipt formats

### 📱 WhatsApp Integration
- Generate WhatsApp broadcast URLs
- Pre-filled messages with allocation summaries
- One-click sharing with group members
- Custom message formatting
- Auto-open WhatsApp with payment details

### 🌐 Public Bill Sharing
- Generate public URLs for bill summaries
- Share expense details without requiring login
- Cached for fast loading worldwide
- Mobile-optimized public pages
- Individual member allocation views

### 📚 Comprehensive API Documentation
- Complete Swagger/OpenAPI specification
- Interactive API explorer
- Detailed request/response examples
- Error handling documentation
- Performance and caching information

---

**Built with ❤️ using Next.js and modern web technologies**
