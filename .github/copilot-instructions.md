# 🤖 AI Agent Instructions for Split Bill Project

## 🏗️ Architecture Overview

This project follows Feature-Sliced Design (FSD) architecture with Next.js 15+. Key structural patterns:

```
src/
├── app/         # Next.js App Router pages and API routes
├── entities/    # Core business logic and data models
├── features/    # Feature-specific components and logic
├── shared/      # Reusable utilities and components
└── widgets/     # Complex UI blocks combining features
```

## 🔑 Core Development Patterns

1. **Authentication Flow**:
   - Clerk handles auth via email, Google & GitHub
   - Protected routes use `@/widgets/auth/protected-route.tsx`
   - User data accessed via `@/entities/user/model/use-current-user.ts`

2. **State Management**:
   - Entity-level models contain core business logic
   - Features compose entity models into user interactions
   - Use React Query for server state and data fetching

3. **Caching Strategy**:
   - CloudFront CDN caches group summaries at edge
   - S3 serves as persistent cache backing
   - Auto-invalidation on data changes via `entities/cache`

## 🔄 Common Workflows

1. **Adding New Features**:
   ```
   src/features/new-feature/
   ├── model/     # Business logic and state
   ├── lib/       # Feature-specific utilities
   └── ui/        # React components
   ```

2. **API Integration**:
   - Add routes under `src/app/api/`
   - Use `shared/api/axios.ts` for HTTP clients
   - Follow contract types in `shared/api/contract/`

3. **Database Changes**:
   - Update schema in `prisma/schema.prisma`
   - Generate types: `bun prisma generate`
   - Use `shared/lib/prisma.ts` for DB access

## ⚡ Quick Tips

1. **Development Setup**:
   ```bash
   bun install        # Install dependencies
   bun dev           # Start development server
   ```

2. **Key Files to Know**:
   - `src/app/providers.tsx` - Global providers and context
   - `src/shared/lib/utils.ts` - Common utilities
   - `src/shared/api/axios.ts` - API client configuration

3. **Testing Conventions**:
   - Components: React Testing Library with MSW
   - API Routes: Integration tests with test database
   - Models: Unit tests for business logic

## 🎯 Project-Specific Patterns

1. **Expense Tracking**:
   - Use `features/bill` for expense-related components
   - OCR receipt scanning via `entities/ocr`
   - Split calculations in `features/bill/lib`

2. **Real-time Updates**:
   - Optimistic UI updates with React Query
   - Cache invalidation via S3 + CloudFront
   - Background sync with `entities/export`

Remember to follow existing patterns in the codebase and leverage the FSD architecture for clear separation of concerns.