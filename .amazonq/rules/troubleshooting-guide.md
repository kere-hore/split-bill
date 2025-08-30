# Troubleshooting Guide & Common Issues

## CloudFront Issues

### 502 Bad Gateway
- **Cause**: Origin pointing to Vercel instead of S3
- **Fix**: Change origin to `split-bill-cache.s3.ap-southeast-1.amazonaws.com`
- **Verify**: Check Origins tab in CloudFront console

### Cache Not Working
- **Cause**: Missing S3 bucket policy or wrong cache keys
- **Fix**: Apply OAC policy, verify cache key format `public/groups/{id}.json`
- **Debug**: Check `X-Cache-Source` header in API response

### Permission Denied
- **Cause**: Missing CloudFront invalidation permission
- **Fix**: Apply IAM policy from `aws-iam-policy.json`
- **Test**: Try creating/updating group, check console logs

## API Issues

### Group Not Found
- **Debug**: Check `/api/groups` for available group IDs
- **Verify**: Ensure group exists and user has access
- **Cache**: Check if cached version exists in S3

### Expense Calculation Errors
- **Validation**: Check Zod schema validation for expense data
- **Split Logic**: Verify calculation functions in `shared/lib/calculations.ts`
- **Database**: Ensure all group members exist

### Slow Response Times
- **Cache Miss**: Normal for first request, should cache after
- **Database**: Check MongoDB Atlas connection
- **CloudFront**: Verify edge location serving request

## Authentication Issues

### Clerk Authentication Failing
- **Keys**: Verify Clerk publishable and secret keys in `.env.local`
- **Middleware**: Check Clerk middleware configuration in `src/middleware.ts`
- **Redirect URLs**: Ensure sign-in/sign-up URLs match Clerk dashboard settings
- **Environment**: Verify all Clerk environment variables are set correctly

### User Session Issues
- **Clerk Config**: Verify Clerk configuration in `shared/lib/auth.ts`
- **Protected Routes**: Check middleware protection on API routes
- **Database Sync**: Ensure user data synced between Clerk and MongoDB
- **Username Generation**: Check auto-generated usernames for users without username

## Development Issues

### Build Errors
- **TypeScript**: Fix type errors, avoid `any` types
- **Dependencies**: Run `bun install` to sync packages
- **Environment**: Verify all required env vars set
- **Clerk Types**: Ensure Clerk types are properly imported

### Group Management Issues
- **Permissions**: Check user permissions for group operations
- **Validation**: Verify group creation/update schemas
- **Member Invites**: Check email validation and user existence

### Settlement Calculation Problems
- **Balance Logic**: Check settlement calculation algorithms
- **Payment Tracking**: Verify payment record creation
- **Debt Resolution**: Ensure proper debt settlement logic

## Debugging Commands
```bash
# Check group cache status
curl -I /api/public/groups/group-id

# Test group summary API
curl /api/groups/group-id

# Test CloudFront direct access
curl https://<cloudfront-domain>.cloudfront.net/public/groups/group-id.json

# Check build
bun build

# Database connection
bun run db:studio

# Test Clerk authentication (requires login first)
curl -b "__session=<clerk-session-cookie>" /api/groups

# Test user sync
curl /api/test-auth

# Check Clerk user data
curl -H "Authorization: Bearer <clerk-jwt>" /api/test-auth
```

## Common Error Messages

### "Group not found"
- **Check**: Group ID exists in database
- **Verify**: User has access to the group
- **Cache**: Clear CloudFront cache if recently created

### "Invalid expense data"
- **Validation**: Check Zod schema for expense creation
- **Amount**: Ensure positive numbers for expense amounts
- **Participants**: Verify all participants are group members

### "Settlement calculation failed"
- **Data Integrity**: Check for missing expense or payment data
- **Algorithm**: Verify settlement calculation logic
- **Database**: Ensure all related records exist