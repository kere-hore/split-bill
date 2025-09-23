# 🤝 Contributing to Split Bill Application

Thank you for your interest in contributing! This guide will help you get started with contributing to the Split Bill expense tracking application.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [FSD Architecture Guidelines](#fsd-architecture-guidelines)
- [Code Standards](#code-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## 🚀 Getting Started

### Prerequisites
1. Read the [README.md](./README.md) for project overview
2. Understand [FSD Architecture](https://feature-sliced.design/)
3. Review project rules in `.amazonq/rules/` directory

### Setup Development Environment
```bash
# Clone the repository
git clone https://github.com/pradiktabagus/split-bill.git
cd split-bill

# Install dependencies
bun install

# Setup environment
cp .env.example .env.local
# Fill in your environment variables

# Setup database
bun run db:generate
bun run db:push

# Start development server
bun dev
```

## 🔄 Development Process

### 1. Choose an Issue
- Browse [open issues](https://github.com/pradiktabagus/split-bill/issues)
- Look for issues labeled `good first issue` for beginners
- Check the project board for current priorities
- Comment on the issue to get assigned

### 2. Create a Branch
```bash
# Create feature branch
git checkout -b feature/issue-number-short-description

# Examples:
git checkout -b feature/123-group-management
git checkout -b bugfix/456-expense-calculation
git checkout -b task/789-update-docs
```

### 3. Follow FSD Architecture
Ensure your changes follow the FSD layer structure:
```
src/
├── app/           # Next.js App Router
├── widgets/       # Complex UI blocks  
├── features/      # Business features
├── entities/      # Business entities
└── shared/        # Shared utilities
```

### 4. Development Guidelines

#### Entity Development
```typescript
// entities/[entity-name]/
├── model/           # Business logic and types
├── api/             # API calls
├── ui/              # Entity UI components
└── index.ts         # Public exports
```

#### Feature Development  
```typescript
// features/[feature-name]/
├── model/           # Feature business logic
├── ui/              # Feature UI components
└── index.ts         # Feature exports
```

#### Widget Development
```typescript
// widgets/[widget-name]/
├── index.tsx        # Main widget component
└── [components]/    # Sub-components if needed
```

## 🏗️ FSD Architecture Guidelines

### Dependency Rules
```
✅ Allowed: App → Widgets → Features → Entities → Shared
❌ Forbidden: Any reverse dependencies
```

### Import Examples
```typescript
// ✅ Correct imports
// In features/group-management/
import { Button } from '@/shared/components/ui/button'
import { useGroup } from '@/entities/group'

// ❌ Wrong imports
// In entities/group/
import { GroupForm } from '@/features/group-management/ui/group-form' // ❌
```

### Layer Responsibilities
- **Entities**: Business logic, data models, API calls (User, Group, Expense, Settlement)
- **Features**: Use cases, feature-specific logic (group management, expense tracking, settlement)
- **Widgets**: Complex UI blocks (dashboard, group list, expense summary)
- **Shared**: Pure utilities, UI components, API contracts
- **App**: Next.js routing, global configuration

## 📏 Code Standards

### TypeScript
- Use strict TypeScript configuration
- Avoid `any` types (use `unknown` instead)
- Provide proper type annotations
- Use generics for reusable types

```typescript
// ✅ Good
interface Expense {
  id: string
  amount: number
  description: string
  metadata?: unknown  // Use unknown for dynamic values
}

// ❌ Bad
interface Expense {
  id: string
  amount: any      // Avoid any
  description: any
}
```

### Code Quality
- Follow ESLint rules
- Use meaningful variable names
- Write self-documenting code
- Add JSDoc for public APIs
- Handle errors gracefully

### Testing
- Write unit tests for business logic
- Add integration tests for API endpoints
- Include component tests for UI
- Maintain >80% test coverage

```typescript
// Example test structure
describe('useGroup', () => {
  describe('createGroup', () => {
    it('should create group successfully', () => {
      // Test implementation
    })
  })
})
```

## 🔀 Pull Request Process

### 1. Before Creating PR
- [ ] Code follows FSD architecture
- [ ] All tests pass
- [ ] ESLint passes without errors
- [ ] Documentation updated (if needed)
- [ ] No breaking changes (or documented)

### 2. PR Template
Use the provided PR template and fill out:
- Description of changes
- Related issues
- FSD architecture compliance
- Testing information
- Performance impact
- Documentation updates

### 3. PR Review Process
1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Architecture review** for FSD compliance
4. **Testing verification**
5. **Documentation review**

### 4. Merge Requirements
- [ ] All CI checks pass
- [ ] At least 1 approving review
- [ ] No merge conflicts
- [ ] Branch is up to date with main

## 📝 Issue Guidelines

### Creating Issues

#### Feature Requests
Use the **🚀 Feature Request** template:
- Specify phase (2, 3, 4, or 5)
- Define acceptance criteria
- List affected FSD layers
- Provide technical requirements

#### Bug Reports
Use the **🐛 Bug Report** template:
- Include reproduction steps
- Specify environment details
- Add error messages/logs
- Attach screenshots if applicable

#### Tasks
Use the **📋 Task** template:
- Define clear objectives
- List files to be modified
- Specify dependencies
- Set acceptance criteria

### Issue Labels
- **Phase**: `phase-2`, `phase-3`, `phase-4`, `phase-5`
- **Priority**: `priority-high`, `priority-medium`, `priority-low`
- **Type**: `enhancement`, `bug`, `task`, `documentation`
- **Component**: `entities`, `features`, `widgets`, `shared`, `api`, `ui`

## 🎯 Contribution Areas

### High Priority Areas
- **Group Management**: Create, edit, delete expense groups
- **Expense Tracking**: Add, edit, delete shared expenses
- **Settlement System**: Track payments between members
- **OCR Integration**: Receipt scanning and expense extraction

### Medium Priority Areas
- **WhatsApp Integration**: Share allocation summaries
- **Public Bill Sharing**: Share expense details via public URLs
- **Analytics Dashboard**: Expense tracking and insights
- **Performance Optimization**: Caching and CDN improvements

### Documentation
- **API Documentation**: Endpoint documentation
- **Architecture Guides**: FSD implementation guides
- **Tutorials**: Step-by-step tutorials
- **Examples**: Code examples and use cases

### Testing
- **Unit Tests**: Business logic testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full workflow testing
- **Performance Tests**: Load and stress testing

## 🔍 Code Review Guidelines

### For Contributors
- **Self-review** your code before submitting
- **Test thoroughly** on different scenarios
- **Document** complex logic with comments
- **Follow** the PR template completely
- **Respond** to review feedback promptly

### For Reviewers
- **Check FSD compliance** first
- **Verify** business logic correctness
- **Test** the changes locally
- **Review** documentation updates
- **Provide constructive** feedback

## 🚨 Common Mistakes to Avoid

### Architecture Violations
```typescript
// ❌ Don't import features in entities
import { GroupForm } from '@/features/group-management/ui/group-form'

// ❌ Don't put business logic in UI components
export function ExpenseForm() {
  const handleSubmit = async (data) => {
    // Complex business logic here ❌
  }
}

// ❌ Don't access database directly in features
import { prisma } from '@/shared/lib/prisma'
```

### Code Quality Issues
- Using `any` types instead of proper typing
- Missing error handling
- Inconsistent naming conventions
- Lack of input validation
- Missing tests for new features

## 📚 Resources

### Documentation
- [Project README](./README.md)
- [API Documentation](./src/app/docs/page.tsx)
- [Architecture Patterns](./.amazonq/rules/architecture-patterns.md)
- [Development Standards](./.amazonq/rules/development-standards.md)

### External Resources
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🤝 Community

### Getting Help
- **GitHub Discussions**: Ask questions and discuss ideas
- **Issues**: Report bugs and request features
- **Documentation**: Check comprehensive guides
- **Code Examples**: Review existing implementations

### Communication
- Be respectful and constructive
- Follow the code of conduct
- Help other contributors
- Share knowledge and best practices

## 📞 Contact

For questions or support:
- Create an issue for bugs or feature requests
- Use GitHub Discussions for general questions
- Check documentation before asking
- Provide detailed information when reporting issues

---

Thank you for contributing to the Split Bill Application! Your contributions help make expense tracking and bill splitting easier for everyone. 🚀