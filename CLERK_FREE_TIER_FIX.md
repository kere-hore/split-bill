# 🆓 Clerk Free Tier Configuration

## Important: Free Tier Limitations

Clerk **Free Tier** tidak memiliki production keys. Harus menggunakan **development keys** bahkan di production.

## Correct Configuration for Free Tier

### Environment Variables (Vercel)
```bash
# Free tier menggunakan development keys di production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Clerk Dashboard Settings

**Domain Configuration:**
1. Go to **Configure > Domains**
2. Add production domain: `split-bill-mu.vercel.app`
3. **Important**: Free tier allows custom domains

**Application URLs:**
```
Home URL: https://split-bill-mu.vercel.app
Sign-in URL: https://split-bill-mu.vercel.app/sign-in
Sign-up URL: https://split-bill-mu.vercel.app/sign-up
```

## Update Environment Variables

```bash
# Revert to development keys for free tier
vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env rm CLERK_SECRET_KEY

# Add development keys
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Enter: pk_test_Y3V0ZS1zYWlsZmlzaC01OC5jbGVyay5hY2NvdW50cy5kZXYk

vercel env add CLERK_SECRET_KEY
# Enter: sk_test_iYoGbV6lKuxyEHbkZuHZLeAgQHV7ol9ham6O0x71f8
```

## Deploy with Correct Keys

```bash
vercel --prod
```

## Free Tier Features Available
- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ Custom domains
- ✅ Up to 10,000 MAU (Monthly Active Users)
- ❌ Production keys (pk_live_/sk_live_)
- ❌ Advanced features

## Test After Update
```bash
# Should work with development keys
curl https://split-bill-mu.vercel.app/api/health
```