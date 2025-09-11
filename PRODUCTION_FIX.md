# 🚨 Production Login Fix

## Masalah yang Teridentifikasi
1. **Development Keys** digunakan di production (pk_test_, sk_test_)
2. **Redirect Loop** di middleware authentication
3. **Missing Production Configuration** di Clerk

## Langkah Perbaikan

### 1. Update Clerk ke Production Mode

**Di Clerk Dashboard:**
1. Buka [Clerk Dashboard](https://dashboard.clerk.com/)
2. Pilih project "Split Bill"
3. **Switch ke Production** (toggle di kanan atas)
4. Copy production keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_live_...)
   - `CLERK_SECRET_KEY` (sk_live_...)

### 2. Update Environment Variables di Vercel

```bash
# Hapus development keys
vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env rm CLERK_SECRET_KEY

# Tambah production keys
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Masukkan: pk_live_...

vercel env add CLERK_SECRET_KEY
# Masukkan: sk_live_...

# Tambah domain untuk production
vercel env add CLERK_WEBHOOK_SECRET
# Generate di Clerk Dashboard > Webhooks
```

### 3. Configure Domain di Clerk

**Di Clerk Dashboard > Domains:**
1. Tambah domain production: `split-bill-mu.vercel.app`
2. Set sebagai primary domain
3. Update redirect URLs:
   - Sign-in URL: `https://split-bill-mu.vercel.app/sign-in`
   - Sign-up URL: `https://split-bill-mu.vercel.app/sign-up`
   - After sign-in: `https://split-bill-mu.vercel.app/dashboard`

### 4. Redeploy Application

```bash
# Deploy ulang dengan konfigurasi baru
vercel --prod

# Atau push ke main branch untuk auto-deploy
git add .
git commit -m "fix: production authentication configuration"
git push origin main
```

## Verifikasi Fix

Setelah deployment:

1. **Test Login Flow:**
   ```
   https://split-bill-mu.vercel.app/sign-in
   ```

2. **Check Console Logs:**
   - Tidak ada error "development keys"
   - Tidak ada redirect loop warnings

3. **Test API Endpoints:**
   ```bash
   curl https://split-bill-mu.vercel.app/api/health
   ```

## Troubleshooting

Jika masih ada masalah:

1. **Clear Browser Cache** dan cookies
2. **Check Network Tab** untuk redirect loops
3. **Verify Environment Variables:**
   ```bash
   vercel env ls
   ```
4. **Check Clerk Logs** di dashboard untuk authentication errors

## Quick Commands

```bash
# Check current deployment
vercel ls

# Check environment variables
vercel env ls

# Force redeploy
vercel --prod --force

# Check logs
vercel logs
```

Setelah mengikuti langkah ini, login flow seharusnya berfungsi normal tanpa redirect loop.