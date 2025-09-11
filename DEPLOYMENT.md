# Production Deployment Fix

## Clerk Configuration Issues

### 1. Switch to Production Keys
Your current error shows development keys (`pk_test_`, `sk_test_`) being used in production.

**In Clerk Dashboard:**
1. Go to your Clerk project
2. Switch to **Production** environment (top right)
3. Copy the **Production** keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_`)

### 2. Add Domain to Clerk
**In Clerk Dashboard > Domains:**
1. Add your Vercel domain: `split-bill-mu.vercel.app`
2. Add any custom domains you're using

### 3. Set Environment Variables in Vercel
```bash
# Set production Clerk keys
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Enter your pk_live_... key

vercel env add CLERK_SECRET_KEY  
# Enter your sk_live_... key

# Set other required vars
vercel env add DATABASE_URL
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
```

### 4. Redeploy
```bash
vercel --prod
```

## Quick Fix Commands

```bash
# 1. Check current env vars
vercel env ls

# 2. Remove development keys if present
vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env rm CLERK_SECRET_KEY

# 3. Add production keys
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production

# 4. Redeploy
vercel --prod
```

## Verification

After deployment, check:
1. `/api/health` - Should show all env vars configured
2. Sign-in flow should work without errors
3. No more "development keys" warnings in console