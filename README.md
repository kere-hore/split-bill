# 💰 Split Bill - Expense Tracker

A modern, full-stack split bill management application built with Next.js, TypeScript, and MongoDB. Track shared expenses and calculate splits among friends and groups with real-time updates.

## ✨ Features

- 🔐 **Authentication**: Clerk with Email, Google & GitHub OAuth
- 👥 **Group Management**: Create and manage expense groups
- 💸 **Expense Tracking**: Add, edit, delete shared expenses
- 🧮 **Smart Splitting**: Automatic calculation of who owes what
- 💳 **Settlement Tracking**: Record payments between group members
- 📊 **Dashboard**: Overview of all groups and balances
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS
- 🌙 **Dark Mode**: Full theme switching support
- 📱 **Responsive**: Mobile-first design
- 🔄 **Real-time**: Optimistic UI updates
- 🛡️ **Type Safe**: Full TypeScript coverage
- 🗄️ **Database**: MongoDB with Prisma ORM
- ☁️ **CloudFront CDN**: Global edge caching for group summaries
- 🚀 **S3 Integration**: File storage and cache management
- ⚡ **Auto-Invalidation**: Instant cache updates on data changes

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.6
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **ORM**: Prisma
- **Authentication**: Clerk
- **UI**: shadcn/ui + Tailwind CSS
- **Package Manager**: Bun
- **Deployment**: Vercel
- **CDN**: AWS CloudFront
- **Storage**: AWS S3
- **Cache**: CloudFront + S3 hybrid caching

## 📋 Prerequisites

### Required Services
1. **MongoDB Atlas** - Database hosting
2. **Clerk Account** - Authentication service
3. **Vercel Account** - Deployment platform
4. **AWS Account** - S3 storage and CloudFront CDN
5. **AWS S3 Bucket** - File storage and caching
6. **AWS CloudFront Distribution** - Global CDN

### Development Tools
- Node.js 18+ or Bun
- Git

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/pradiktabagus/feature-toggle.git
cd feature-toggle
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
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/split-bill"

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

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Get connection string
4. Add to `DATABASE_URL` in `.env.local`

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

### AWS Setup
1. Create AWS account and get access keys
2. Create S3 bucket for file storage
3. Create CloudFront distribution pointing to your API
4. Set up IAM permissions for S3 and CloudFront access
5. Configure CloudFront to cache `/api/public/toggles/*` paths

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
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add GITHUB_ID
   vercel env add GITHUB_SECRET
   ```

4. **Update OAuth Callback URLs** with your Vercel domain

### Auto-Deploy Setup
Connect your GitHub repository to Vercel for automatic deployments on every push to main branch.

## 🎯 Usage

### Managing Split Bills
1. Login with Email, Google, or GitHub
2. Create a new group for shared expenses
3. Invite members to the group
4. Add expenses and specify who paid
5. System automatically calculates splits
6. Track settlements between members
7. View dashboard for overview of all groups

### API Endpoints
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create new group
- `PUT /api/groups/[id]` - Update group
- `DELETE /api/groups/[id]` - Delete group
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Add new expense
- `GET /api/settlements` - List settlements
- `POST /api/settlements` - Record payment
- `GET /api/public/groups/[id]` - Get group summary (cached)

### Caching Strategy
- **Public API**: Cached via CloudFront + S3 hybrid
- **Auto-Invalidation**: Cache cleared on toggle updates
- **Cache Headers**: Configurable via environment variables
- **Monitoring**: CloudFront hit/miss tracking in response headers

## 🔒 Security Features

- ✅ Authentication required for admin operations
- ✅ CSRF protection via NextAuth.js
- ✅ Input validation with Zod schemas
- ✅ Type-safe database operations
- ✅ Environment variable security
- ✅ AWS IAM permissions for S3/CloudFront
- ✅ Public API rate limiting via CloudFront
- ✅ Secure file uploads to S3

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the [Issues](https://github.com/pradiktabagus/feature-toggle/issues) page
2. Create a new issue with detailed description
3. Include error logs and environment details

## 🎉 Demo

Live demo: [https://split-bill-mu.vercel.app](https://split-bill-mu.vercel.app)

---

**Built with ❤️ using Next.js and modern web technologies**
# Trigger CI
