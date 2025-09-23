# 📚 Aplikasi Split Bill - Dokumentasi Bahasa Indonesia

Selamat datang di dokumentasi lengkap Aplikasi Split Bill dalam Bahasa Indonesia. Dokumentasi ini mencakup arsitektur, fitur, panduan pengembangan, dan referensi API.

## 📖 Daftar Isi

### 🏗️ Arsitektur
- [Arsitektur FSD](./architecture/fsd-architecture.md) - Implementasi Feature-Sliced Design
- [Arsitektur Sistem](./architecture/system-architecture.md) - Desain sistem keseluruhan
- [Skema Database](./architecture/database-schema.md) - Struktur dan relasi database

### 🚀 Memulai
- [Panduan Instalasi](./guides/getting-started.md) - Setup dan instalasi
- [Setup Development](./guides/development-setup.md) - Environment development lokal
- [Panduan Deployment](./guides/deployment.md) - Deployment ke production

### 🎯 Fitur
- [Fitur Utama](./features/core-features.md) - Overview fitur yang sudah diimplementasi
- [Sistem Autentikasi](./features/authentication.md) - Sistem autentikasi pengguna
- [Manajemen Grup](./features/group-management.md) - Pembuatan dan pengelolaan grup
- [Pelacakan Pengeluaran](./features/expense-tracking.md) - Sistem manajemen pengeluaran
- [Sistem Settlement](./features/settlement-system.md) - Pelacakan pembayaran dan settlement

### 🔌 Referensi API
- [Overview API](./api/overview.md) - Arsitektur dan konvensi API
- [API Autentikasi](./api/authentication.md) - Endpoint autentikasi
- [API Grup](./api/groups.md) - Endpoint manajemen grup
- [API Pengeluaran](./api/expenses.md) - Endpoint pelacakan pengeluaran
- [API Settlement](./api/settlements.md) - Endpoint manajemen settlement

### 🛠️ Pengembangan
- [Menambah Fitur](./guides/adding-features.md) - Cara menambah fitur baru
- [Aturan FSD](./guides/fsd-rules.md) - Panduan arsitektur FSD
- [Panduan Testing](./guides/testing.md) - Standar dan praktik testing
- [Optimasi Performa](./guides/performance.md) - Best practices performa

## 🎯 Mulai Cepat

1. **Clone repository**
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
   # Isi environment variables Anda
   ```

4. **Setup database**
   ```bash
   bun run db:generate
   bun run db:push
   ```

5. **Jalankan development server**
   ```bash
   bun dev
   ```

## 🏗️ Overview Arsitektur

Aplikasi Split Bill mengikuti metodologi **Feature-Sliced Design (FSD)**:

### Struktur Layer
```
src/
├── app/           # Next.js App Router - routing dan providers
├── widgets/       # UI blocks kompleks - dashboard, forms, lists
├── features/      # Business features - manajemen grup, pelacakan pengeluaran
├── entities/      # Business entities - User, Group, Expense, Settlement
└── shared/        # Shared utilities - API, components, utils
```

### Aturan Dependency
- **Diizinkan**: `app → widgets → features → entities → shared`
- **Dilarang**: Dependency terbalik

## 🚀 Fitur Utama

### ✅ Fitur Saat Ini
- **Autentikasi Multi-provider** - Clerk dengan Email, Google, GitHub
- **Manajemen Grup** - Buat, edit, kelola grup pengeluaran
- **Pelacakan Pengeluaran** - Tambah pengeluaran dengan upload struk
- **Integrasi OCR** - Scan struk otomatis dengan Google Vision API
- **Sistem Settlement** - Lacak pembayaran antar anggota
- **Integrasi WhatsApp** - Bagikan ringkasan alokasi
- **Berbagi Bill Publik** - Bagikan pengeluaran via URL publik
- **Sistem Caching** - CloudFront + S3 untuk performa
- **Desain Responsif** - Mobile-first dengan dark mode

### 🔄 Roadmap
- Dukungan multi-mata uang
- Dashboard analytics lanjutan
- Pengeluaran berulang
- Aplikasi mobile
- Fitur enterprise

## 🛠️ Stack Teknologi

### Frontend
- **Framework**: Next.js 15 dengan App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form + validasi Zod

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL dengan Prisma ORM
- **Authentication**: Clerk
- **File Storage**: AWS S3
- **CDN**: AWS CloudFront

### Layanan Eksternal
- **OCR**: Google Cloud Vision API
- **Messaging**: Generasi URL WhatsApp
- **Deployment**: Vercel
- **Monitoring**: Vercel Analytics

## 📊 Performa

### Strategi Caching
- **Browser Cache**: 5 menit untuk konten dinamis
- **CloudFront Cache**: 1 jam untuk API publik
- **S3 Cache**: Penyimpanan persisten untuk data publik
- **Auto-invalidation**: Update cache real-time

### Fitur Optimasi
- Code splitting dengan Next.js
- Optimasi gambar
- Caching response API
- Optimasi query database
- Monitoring ukuran bundle

## 🔒 Keamanan

### Autentikasi & Otorisasi
- OAuth 2.0 dengan multiple providers
- Manajemen JWT token
- Role-based access control
- Manajemen session

### Perlindungan Data
- Validasi input dengan skema Zod
- Pencegahan SQL injection dengan Prisma
- Perlindungan XSS
- Konfigurasi CORS
- Keamanan environment variables

## 🤝 Berkontribusi

Kami menyambut kontribusi! Silakan baca [Panduan Kontribusi](../../CONTRIBUTING.md) untuk:

- Instruksi setup development
- Panduan arsitektur FSD
- Standar kualitas kode
- Proses pull request
- Template pembuatan issue

## 📞 Dukungan & Sumber Daya

### Dokumentasi
- [Dokumentasi API Live](https://split-bill-mu.vercel.app/api/docs)
- [Repository GitHub](https://github.com/pradiktabagus/split-bill)
- [Panduan Kontribusi](../../CONTRIBUTING.md)

### Komunitas
- [GitHub Issues](https://github.com/pradiktabagus/split-bill/issues)
- [GitHub Discussions](https://github.com/pradiktabagus/split-bill/discussions)
- [Demo Live](https://split-bill-mu.vercel.app)

### Sumber Daya Eksternal
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Dokumentasi Next.js](https://nextjs.org/docs)
- [Dokumentasi Prisma](https://www.prisma.io/docs)
- [Dokumentasi Clerk](https://clerk.com/docs)

---

**Selamat coding! 🚀**