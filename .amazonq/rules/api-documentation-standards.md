# API Documentation Standards

## Mandatory Documentation Requirements

### For Every New API Endpoint
When creating any new API endpoint, you MUST:

1. **Create the API route** in appropriate directory structure
2. **Add Swagger/OpenAPI specification** to `/api/docs/route.ts`
3. **Update documentation page** at `/docs/page.tsx` with examples
4. **Include TypeScript types** in `/shared/types/`

### Swagger Documentation Rules

#### Required Fields for Each Endpoint
- **summary**: Brief description of what the endpoint does
- **description**: Detailed explanation of functionality
- **tags**: Categorize endpoints (OCR, Groups, Expenses, etc.)
- **requestBody**: Complete schema for request data
- **responses**: All possible response codes (200, 400, 404, 500)
- **examples**: Real-world request/response examples

#### Schema Requirements
- **All request/response objects** must have corresponding TypeScript interfaces
- **Include field descriptions** and examples for each property
- **Mark nullable fields** appropriately
- **Define enums** for restricted values
- **Add validation rules** (format, pattern, min/max)

### Documentation Structure

#### API Docs JSON (`/api/docs/route.ts`)
```typescript
paths: {
  '/your-endpoint': {
    post: {
      summary: 'Brief description',
      description: 'Detailed explanation',
      tags: ['Category'],
      requestBody: { /* schema */ },
      responses: { /* all status codes */ }
    }
  }
}
```

#### Documentation Page (`/docs/page.tsx`)
For each API endpoint, include:
- **HTTP method and URL**
- **Request format** with examples
- **Response examples** (success and error)
- **cURL command** example
- **JavaScript/TypeScript** usage example
- **Important notes** about data formats or limitations

### Example Implementation

When creating `/api/groups/route.ts`, also add:

1. **Swagger spec** in `/api/docs/route.ts`:
```typescript
'/groups': {
  get: {
    summary: 'List user groups',
    tags: ['Groups'],
    responses: {
      200: { schema: { $ref: '#/components/schemas/GroupList' } }
    }
  }
}
```

2. **Documentation section** in `/docs/page.tsx`:
```tsx
<section>
  <h2>Groups API</h2>
  <div>
    <span className="method">GET</span>
    <code>/api/groups</code>
  </div>
  {/* Examples and usage */}
</section>
```

3. **TypeScript types** in `/shared/types/groups.ts`:
```typescript
export interface Group {
  id: string
  name: string
  // ... other fields
}
```

### Documentation Maintenance

- **Update immediately** when API changes
- **Keep examples current** with actual API behavior
- **Test all examples** before committing
- **Version documentation** with API changes
- **Include migration notes** for breaking changes

### Quality Standards

- **Complete coverage**: Every endpoint documented
- **Accurate examples**: All examples must work
- **Clear descriptions**: Non-technical users can understand
- **Consistent formatting**: Follow established patterns
- **Error scenarios**: Document all error cases

## Enforcement

- **Code reviews** must verify documentation completeness
- **No API merges** without corresponding documentation
- **Documentation-first** approach for new features
- **Regular audits** to ensure docs stay current

This ensures every API endpoint has comprehensive, up-to-date documentation that developers can rely on.