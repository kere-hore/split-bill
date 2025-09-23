# 📚 Split Bill Application - Documentation

Welcome to the comprehensive documentation for the Split Bill Application. This documentation covers architecture, features, development guides, and API references.

## 🌍 Language Options

- **[English Documentation](./en/README.md)** - Complete English documentation
- **[Dokumentasi Bahasa Indonesia](./id/README.md)** - Dokumentasi lengkap dalam Bahasa Indonesia

## 📖 Quick Navigation

### 🏗️ Architecture
- [FSD Architecture Overview](./en/architecture/fsd-architecture.md)
- [System Architecture](./en/architecture/system-architecture.md)
- [Database Schema](./en/architecture/database-schema.md)

### 🚀 Getting Started
- [Installation Guide](./en/guides/getting-started.md)
- [Development Setup](./en/guides/development-setup.md)
- [Deployment Guide](./en/guides/deployment.md)

### 🎯 Features
- [Core Features](./en/features/core-features.md)
- [API Endpoints](./en/api/overview.md)
- [Authentication](./en/features/authentication.md)

### 🛠️ Development
- [Adding New Features](./en/guides/adding-features.md)
- [FSD Development Rules](./en/guides/fsd-rules.md)
- [Testing Guidelines](./en/guides/testing.md)

## 🎯 What is Split Bill Application?

Split Bill is a modern expense tracking and bill splitting application that helps groups manage shared expenses efficiently. Built with Next.js, TypeScript, and PostgreSQL, it provides:

- **Group Management**: Create and manage expense groups
- **Expense Tracking**: Add, edit, and categorize shared expenses
- **OCR Integration**: Scan receipts automatically with Google Vision API
- **Settlement System**: Track payments between group members
- **WhatsApp Integration**: Share allocation summaries via WhatsApp
- **Public Bill Sharing**: Share expense details with public URLs
- **Real-time Calculations**: Automatic split calculations and balance tracking

## 🏗️ Architecture Overview

The application follows **Feature-Sliced Design (FSD)** architecture:

```
src/
├── app/           # Next.js App Router (routing only)
├── widgets/       # Complex UI blocks
├── features/      # Business features
├── entities/      # Business entities
└── shared/        # Shared utilities
```

## 🚀 Key Technologies

- **Frontend**: Next.js 15, TypeScript, React Query, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon/Supabase)
- **Authentication**: Clerk (Email, Google, GitHub OAuth)
- **OCR**: Google Cloud Vision API
- **CDN**: AWS CloudFront + S3 caching
- **Deployment**: Vercel

## 📊 Current Status

### ✅ Implemented Features
- User authentication with multiple providers
- Group creation and management
- Expense tracking with receipt upload
- OCR receipt scanning
- Settlement calculation and tracking
- WhatsApp integration for sharing
- Public bill sharing with cached URLs
- Responsive UI with dark mode support

### 🔄 In Development
- Advanced settlement tracking
- Multi-currency support
- Analytics dashboard
- Mobile app optimization
- Performance improvements

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details on:

- Development setup
- FSD architecture guidelines
- Code standards
- Pull request process
- Issue creation guidelines

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/pradiktabagus/split-bill/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pradiktabagus/split-bill/discussions)
- **API Docs**: [Live API Documentation](https://split-bill-mu.vercel.app/api/docs)
- **Demo**: [Live Application](https://split-bill-mu.vercel.app)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ using modern web technologies and FSD architecture principles.**