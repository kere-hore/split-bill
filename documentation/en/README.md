# 📚 Split Bill Application - English Documentation

Welcome to the comprehensive English documentation for the Split Bill Application. This documentation covers architecture, features, development guides, and API references.

## 📖 Table of Contents

### 🏗️ Architecture
- [FSD Architecture](./architecture/fsd-architecture.md) - Feature-Sliced Design implementation
- [System Architecture](./architecture/system-architecture.md) - Overall system design
- [Database Schema](./architecture/database-schema.md) - Database structure and relationships

### 🚀 Getting Started
- [Installation Guide](./guides/getting-started.md) - Setup and installation
- [Development Setup](./guides/development-setup.md) - Local development environment
- [Deployment Guide](./guides/deployment.md) - Production deployment

### 🎯 Features
- [Core Features](./features/core-features.md) - Implemented features overview
- [Authentication](./features/authentication.md) - User authentication system
- [Group Management](./features/group-management.md) - Group creation and management
- [Expense Tracking](./features/expense-tracking.md) - Expense management system
- [Settlement System](./features/settlement-system.md) - Payment tracking and settlement

### 🔌 API Reference
- [API Overview](./api/overview.md) - API architecture and conventions
- [Authentication API](./api/authentication.md) - Auth endpoints
- [Groups API](./api/groups.md) - Group management endpoints
- [Expenses API](./api/expenses.md) - Expense tracking endpoints
- [Settlements API](./api/settlements.md) - Settlement management endpoints

### 🛠️ Development
- [Adding Features](./guides/adding-features.md) - How to add new features
- [FSD Rules](./guides/fsd-rules.md) - FSD architecture guidelines
- [Testing Guidelines](./guides/testing.md) - Testing standards and practices
- [Performance Optimization](./guides/performance.md) - Performance best practices

## 🎯 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/pradiktabagus/split-bill.git
   cd split-bill
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

4. **Setup database**
   ```bash
   bun run db:generate
   bun run db:push
   ```

5. **Start development server**
   ```bash
   bun dev
   ```

## 🏗️ Architecture Overview

The Split Bill Application follows **Feature-Sliced Design (FSD)** methodology:

### Layer Structure
```
src/
├── app/           # Next.js App Router - routing and providers
├── widgets/       # Complex UI blocks - dashboard, forms, lists
├── features/      # Business features - group management, expense tracking
├── entities/      # Business entities - User, Group, Expense, Settlement
└── shared/        # Shared utilities - API, components, utils
```

### Dependency Rules
- **Allowed**: `app → widgets → features → entities → shared`
- **Forbidden**: Any reverse dependencies

## 🚀 Key Features

### ✅ Current Features
- **Multi-provider Authentication** - Clerk with Email, Google, GitHub
- **Group Management** - Create, edit, manage expense groups
- **Expense Tracking** - Add expenses with receipt upload
- **OCR Integration** - Automatic receipt scanning with Google Vision API
- **Settlement System** - Track payments between members
- **WhatsApp Integration** - Share allocation summaries
- **Public Bill Sharing** - Share expenses via public URLs
- **Caching System** - CloudFront + S3 for performance
- **Responsive Design** - Mobile-first with dark mode

### 🔄 Roadmap
- Multi-currency support
- Advanced analytics dashboard
- Recurring expenses
- Mobile app
- Enterprise features

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form + Zod validation

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **File Storage**: AWS S3
- **CDN**: AWS CloudFront

### External Services
- **OCR**: Google Cloud Vision API
- **Messaging**: WhatsApp URL generation
- **Deployment**: Vercel
- **Monitoring**: Vercel Analytics

## 📊 Performance

### Caching Strategy
- **Browser Cache**: 5 minutes for dynamic content
- **CloudFront Cache**: 1 hour for public APIs
- **S3 Cache**: Persistent storage for public data
- **Auto-invalidation**: Real-time cache updates

### Optimization Features
- Code splitting with Next.js
- Image optimization
- API response caching
- Database query optimization
- Bundle size monitoring

## 🔒 Security

### Authentication & Authorization
- OAuth 2.0 with multiple providers
- JWT token management
- Role-based access control
- Session management

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention with Prisma
- XSS protection
- CORS configuration
- Environment variable security

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](../../CONTRIBUTING.md) for:

- Development setup instructions
- FSD architecture guidelines
- Code quality standards
- Pull request process
- Issue creation templates

## 📞 Support & Resources

### Documentation
- [Live API Documentation](https://split-bill-mu.vercel.app/api/docs)
- [GitHub Repository](https://github.com/pradiktabagus/split-bill)
- [Contributing Guidelines](../../CONTRIBUTING.md)

### Community
- [GitHub Issues](https://github.com/pradiktabagus/split-bill/issues)
- [GitHub Discussions](https://github.com/pradiktabagus/split-bill/discussions)
- [Live Demo](https://split-bill-mu.vercel.app)

### External Resources
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)

---

**Happy coding! 🚀**