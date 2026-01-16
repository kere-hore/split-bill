# Technology Stack

## Framework & Runtime

- **Next.js 15.4.6** - React framework with App Router
- **React 19.1.0** - UI library with latest features
- **TypeScript 5** - Type-safe development
- **Bun** - Package manager and runtime (preferred over npm)

## Database & ORM

- **PostgreSQL** - Primary database (hosted on Neon/Supabase)
- **Prisma 6.2.0** - Database ORM with type generation
- **Redis 5.8.2** - Caching layer

## Authentication & Security

- **Clerk 6.31.6** - Authentication service (Email, Google, GitHub OAuth)
- **Middleware** - Route protection and auth validation

## UI & Styling

- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI primitives
- **Radix UI** - Headless UI components for accessibility
- **Lucide React** - Icon library
- **next-themes** - Dark/light mode support

## State Management & Data Fetching

- **TanStack Query 5.85.3** - Server state management and caching
- **Zustand 5.0.7** - Client state management
- **React Hook Form 7.62.0** - Form state and validation
- **Zod 4.0.17** - Schema validation

## External Services

- **AWS S3** - File storage for receipts and cache
- **AWS CloudFront** - CDN for public API caching
- **Google Cloud Vision API** - OCR for receipt scanning
- **WhatsApp URL API** - Message broadcasting

## Development Tools

- **ESLint** - Code linting with FSD architecture rules
- **eslint-plugin-boundaries** - Enforce layer dependencies
- **Prisma Studio** - Database GUI
- **Swagger/OpenAPI** - API documentation

## Common Commands

### Development

```bash
# Start development server with Turbopack
bun dev

# Build for production
bun run build

# Start production server
bun start
```

### Database Operations

```bash
# Generate Prisma client
bun run db:generate

# Push schema changes to database
bun run db:push

# Run database migrations
bun run db:migrate

# Reset database (development only)
bun run db:reset

# Open Prisma Studio
bun run db:studio

# Add database indexes
bun run db:indexes
```

### Deployment

```bash
# Deploy to Vercel production
bun run deploy

# Deploy preview to Vercel
bun run deploy:preview

# Lint code
bun run lint
```

### Package Management

```bash
# Install dependencies
bun install

# Add new dependency
bun add <package>

# Add dev dependency
bun add -d <package>

# Remove dependency
bun remove <package>
```

## Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `GOOGLE_CLOUD_PROJECT_ID` - Google Cloud project
- `GOOGLE_CLOUD_PRIVATE_KEY` - Service account private key
- `GOOGLE_CLOUD_CLIENT_EMAIL` - Service account email
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `S3_BUCKET_NAME` - S3 bucket for storage
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution
- `NEXT_PUBLIC_CLOUDFRONT_URL` - CloudFront domain

## Performance Optimizations

- **Turbopack** - Fast development builds
- **CloudFront CDN** - Global edge caching for public APIs
- **TanStack Query** - Intelligent data caching and synchronization
- **Next.js Image Optimization** - Automatic image optimization
- **Bundle Analysis** - Code splitting and tree shaking
