# 🔧 Clerk Domain Configuration Fix

## Masalah Redirect Loop

Berdasarkan network logs, masalah ada pada **Clerk handshake process** yang menyebabkan redirect loop.

## Langkah Perbaikan di Clerk Dashboard

### 1. **Periksa Domain Configuration**

Di [Clerk Dashboard](https://dashboard.clerk.com/):

1. **Go to Settings > Domains**
2. **Pastikan domain production sudah ditambahkan:**
   ```
   split-bill-mu.vercel.app
   ```
3. **Set sebagai Primary Domain**

### 2. **Update Redirect URLs**

Di **Settings > Paths**:
```
Sign-in URL: /sign-in
Sign-up URL: /sign-up
Home URL: /dashboard
After sign-in URL: /dashboard
After sign-up URL: /dashboard
```

### 3. **Check Application URLs**

Di **Settings > General**:
```
Application URL: https://split-bill-mu.vercel.app
```

### 4. **Verify Environment Variables**

Pastikan di Vercel environment variables:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Quick Test Commands

```bash
# Test redirect flow
curl -I -L --max-redirs 10 https://split-bill-mu.vercel.app/

# Test sign-in page
curl -I https://split-bill-mu.vercel.app/sign-in

# Test health check
curl https://split-bill-mu.vercel.app/api/health
```

## Troubleshooting Steps

1. **Clear browser cache** dan cookies
2. **Try incognito mode** untuk test
3. **Check Clerk Dashboard logs** untuk error messages
4. **Verify domain** di Clerk settings

## Expected Flow

```
/ → /sign-up (unauthenticated)
/sign-in → Clerk auth → /dashboard (after login)
/dashboard → /sign-in (unauthenticated)
```

Setelah mengikuti langkah ini, redirect loop seharusnya teratasi.