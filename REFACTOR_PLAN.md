# FSD Refactoring Plan

## 1. API Layer Consolidation

### Current Structure (Mixed)
```
src/entities/group/api/groups.ts        # React Query hooks
src/shared/api/contract/groups/client.ts # HTTP client
```

### Target Structure (Clean)
```
src/shared/api/groups/
├── client.ts     # HTTP calls only
├── queries.ts    # React Query hooks
├── types.ts      # API types
└── index.ts      # Barrel exports
```

## 2. Widget Layer Improvement

### Current (Tight Coupling)
```typescript
// Widget directly using feature hooks
import { useBillsToPayManagement } from "@/features/bills-to-pay-management";
```

### Target (Loose Coupling)
```typescript
// Widget composing feature components
import { BillsToPayManagement } from "@/features/bills-to-pay-management";
```

## 3. Add Pages Layer

### Current
```
src/app/(private)/dashboard/page.tsx  # Direct widget usage
```

### Target
```
src/pages/dashboard/
├── ui/dashboard-page.tsx
├── model/use-dashboard-page.ts
└── index.ts
```

## 4. Entity API Cleanup

### Move React Query hooks from entities to shared/api
- `src/entities/*/api/*.ts` → `src/shared/api/*/queries.ts`
- Keep only pure business logic in entities
- Entities should not know about React Query

## 5. Feature Component Exports

### Ensure features export components, not just hooks
```typescript
// features/bills-to-pay-management/index.ts
export { BillsToPayManagement } from './ui/bills-to-pay-management';
export { useBillsToPayManagement } from './model/use-bills-to-pay-management';
```

## Implementation Priority
1. **High**: API layer consolidation
2. **Medium**: Widget dependency cleanup  
3. **Low**: Pages layer addition (optional with Next.js App Router)