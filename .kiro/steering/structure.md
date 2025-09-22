# Project Structure & Architecture

## Feature-Sliced Design (FSD) Architecture

This project follows **Feature-Sliced Design (FSD)** methodology with strict layer dependencies and clear separation of concerns.

## Layer Hierarchy & Dependencies

```
App → Widgets → Features → Entities → Shared
```

### Dependency Rules

- **Shared** - Cannot import from any other layer (pure utilities)
- **Entities** - Can only import from Shared (business domain logic)
- **Features** - Can import from Entities and Shared (use cases)
- **Widgets** - Can import from Features, Entities, and Shared (complex UI blocks)
- **App** - Can import from all layers (routing and initialization)

## Directory Structure

```
src/
├── app/                    # Next.js App Router & API routes
│   ├── (auth)/            # Authentication pages
│   ├── (private)/         # Protected routes
│   ├── api/               # API endpoints
│   ├── public/            # Public pages (no auth)
│   ├── layout.tsx         # Root layout
│   └── providers.tsx      # Global providers
├── entities/              # Business entities & domain logic
│   ├── allocation/        # Expense allocation logic
│   ├── bill/              # Bill management
│   ├── bills-to-pay/      # Payment tracking
│   ├── cache/             # Cache management
│   ├── dashboard/         # Dashboard data
│   ├── group/             # Group management
│   ├── ocr/               # OCR processing
│   ├── settlement/        # Payment settlements
│   ├── user/              # User management
│   └── user-profile/      # User profile data
├── features/              # Business features & use cases
│   ├── allocation-management/     # Allocation workflows
│   ├── bill/                     # Bill creation & editing
│   ├── bills-to-pay-management/  # Payment management
│   ├── dashboard-analytics/      # Dashboard features
│   ├── settlement-management/    # Settlement workflows
│   └── user-profile-management/  # Profile management
├── widgets/               # Complex UI compositions
│   ├── allocation-detail/         # Allocation detail view
│   ├── allocations/              # Allocation list widget
│   ├── auth/                     # Authentication widgets
│   ├── bills-to-pay/            # Bills to pay widget
│   ├── dashboard/               # Dashboard widget
│   ├── settlement-detail/       # Settlement detail view
│   ├── settlement-list/         # Settlement list widget
│   └── user-settings/           # User settings widget
└── shared/                # Reusable utilities & components
    ├── api/               # HTTP client & contracts
    ├── components/        # UI components (shadcn/ui)
    ├── hooks/             # Reusable React hooks
    ├── lib/               # Pure utility functions
    └── types/             # Shared TypeScript types
```

## File Naming Conventions

### Entity Structure

```
entities/[entity-name]/
├── api/
│   └── [entity-name].ts           # API calls
├── model/
│   ├── [entity-name]-service.ts   # Business logic
│   └── use-[entity-name].ts       # React hooks
├── ui/                            # Entity-specific UI (if needed)
│   └── [entity-name]-item.tsx
└── index.ts                       # Public exports
```

### Feature Structure

```
features/[feature-name]/
├── lib/
│   └── [feature-name]-schema.ts   # Validation schemas
├── model/
│   ├── use-[feature-name].ts      # Business logic hooks
│   └── use-[feature-name]-logic.ts
├── ui/
│   ├── [feature-name]-form.tsx    # Form components
│   ├── [feature-name]-modal.tsx   # Modal components
│   └── [feature-name]-list.tsx    # List components
└── index.ts                       # Feature exports
```

### Widget Structure

```
widgets/[widget-name]/
└── index.tsx                      # Main widget component
```

## Import Path Aliases

```typescript
// TypeScript path mapping
"@/*": ["./src/*"]
"entities/*": ["./src/entities/*"]
"features/*": ["./src/features/*"]
"shared/*": ["./src/shared/*"]
"widgets/*": ["./src/widgets/*"]
```

### Import Examples

```typescript
// ✅ Correct imports
import { Button } from "@/shared/components/ui/button";
import { useCurrentUser } from "@/entities/user";
import { BillForm } from "@/features/bill";
import { DashboardWidget } from "@/widgets/dashboard";

// ❌ Avoid relative imports for cross-layer dependencies
import { Button } from "../../../shared/components/ui/button";
```

## API Route Organization

```
src/app/api/
├── allocations/           # Allocation endpoints
├── bills/                 # Bill CRUD operations
├── dashboard/             # Dashboard data
├── groups/                # Group management
│   └── [id]/
│       ├── allocations/   # Group-specific allocations
│       ├── members/       # Group member management
│       └── settlements/   # Group settlements
├── ocr/                   # OCR processing
├── public/                # Public API (cached)
│   ├── allocations/       # Public allocation views
│   └── bills/             # Public bill views
├── settlements/           # Settlement management
└── user/                  # User operations
```

## Database Schema Organization

### Core Models

- **User** - Authentication and profile data
- **Group** - Expense groups with members
- **Bill** - Receipt/expense data with items
- **Settlement** - Payment tracking between users

### Relationships

- User → Groups (many-to-many via GroupMember)
- Group → Bills (one-to-many)
- Bill → BillItems (one-to-many)
- BillItem → BillItemAllocations (one-to-many)

## Component Architecture

### Shared Components (`src/shared/components/`)

```
ui/                        # shadcn/ui components
├── button.tsx            # Base button component
├── dialog.tsx            # Modal dialogs
├── form.tsx              # Form components
├── table.tsx             # Data tables
└── ...

app-sidebar.tsx           # Application sidebar
data-table.tsx            # Reusable data table
site-header.tsx           # Site header
```

### Component Composition

```typescript
// Widget composes features and entities
export function DashboardWidget() {
  return (
    <div>
      <DashboardOverview /> {/* Feature */}
      <RecentActivities /> {/* Feature */}
      <BillsToPay /> {/* Feature */}
    </div>
  );
}

// Feature uses entities and shared components
export function DashboardOverview() {
  const { stats } = useDashboard(); // Entity

  return (
    <Card>
      {" "}
      {/* Shared */}
      <DashboardStats stats={stats} />
    </Card>
  );
}
```

## Code Organization Rules

### Business Logic Placement

- **Entities**: Core domain logic, data fetching, state management
- **Features**: Use case orchestration, form handling, user workflows
- **Widgets**: UI composition, layout management
- **Shared**: Pure functions, reusable components, utilities

### State Management

- **TanStack Query**: Server state in entities
- **Zustand**: Global client state (if needed)
- **React Hook Form**: Form state in features
- **useState**: Local component state

### Error Handling

- **API Layer**: Consistent error responses
- **Entity Layer**: Error state management
- **Feature Layer**: User-friendly error handling
- **UI Layer**: Error display components

## Performance Considerations

### Code Splitting

- Lazy load widgets and heavy features
- Dynamic imports for large components
- Route-based code splitting via Next.js

### Caching Strategy

- **TanStack Query**: Client-side caching
- **CloudFront**: CDN caching for public APIs
- **Redis**: Server-side caching
- **Next.js**: Static generation where possible

### Bundle Optimization

- Tree shaking for unused code
- Barrel exports in index files
- Minimal re-exports to reduce bundle size
