# Release Process

## Overview

Proyek ini menggunakan release-based deployment untuk production. Berikut adalah alur deployment:

```
Development → Master (Staging) → Release Tag → Production
```

## Deployment Environments

### 1. **Preview Deployments**

- **Trigger**: Pull Request ke master
- **Environment**: Vercel Preview
- **Purpose**: Testing fitur sebelum merge

### 2. **Staging Deployment**

- **Trigger**: Push ke branch `master`
- **Environment**: Vercel Preview (staging)
- **Purpose**: Testing integrasi dan UAT
- **URL**: Akan muncul di Vercel dashboard

### 3. **Production Deployment**

- **Trigger**: Release tag published
- **Environment**: Vercel Production
- **Purpose**: Live application
- **URL**: https://split-bill-mu.vercel.app/

## How to Release

### Method 1: Manual Release (Recommended)

1. **Pastikan master branch stabil**

   ```bash
   git checkout master
   git pull origin master
   ```

2. **Buat release melalui GitHub Actions**

   - Buka GitHub → Actions → "Create Release"
   - Klik "Run workflow"
   - Masukkan version (e.g., `v1.2.0`)
   - Masukkan release notes (optional)
   - Klik "Run workflow"

3. **Workflow akan otomatis:**
   - Run tests dan build
   - Generate changelog dari commits
   - Buat release tag
   - Trigger production deployment

### Method 2: Manual GitHub Release

1. **Buat tag locally**

   ```bash
   git tag -a v1.2.0 -m "Release version 1.2.0"
   git push origin v1.2.0
   ```

2. **Buat release di GitHub**
   - Buka GitHub → Releases → "Create a new release"
   - Pilih tag yang sudah dibuat
   - Tulis release notes
   - Klik "Publish release"

## Version Naming Convention

Gunakan [Semantic Versioning](https://semver.org/):

- **Major** (`v2.0.0`): Breaking changes
- **Minor** (`v1.1.0`): New features, backward compatible
- **Patch** (`v1.0.1`): Bug fixes, backward compatible

### Examples:

- `v1.0.0` - Initial release
- `v1.1.0` - Added new expense splitting feature
- `v1.1.1` - Fixed OCR scanning bug
- `v2.0.0` - Changed API structure (breaking change)

## Release Notes Template

```markdown
## 🚀 What's New

- New feature 1
- New feature 2

## 🐛 Bug Fixes

- Fixed issue with expense calculation
- Resolved OCR scanning timeout

## 🔧 Improvements

- Performance optimization
- UI/UX enhancements

## 🔄 Breaking Changes (if any)

- API endpoint changes
- Database schema updates

## 📋 Migration Notes (if needed)

- Steps to migrate from previous version
```

## Rollback Process

Jika terjadi masalah di production:

1. **Quick Rollback**

   ```bash
   # Deploy previous release tag
   git checkout [previous-tag]
   # Trigger manual deployment via GitHub Actions
   ```

2. **Hotfix Release**
   ```bash
   git checkout master
   git checkout -b hotfix/critical-fix
   # Make fixes
   git commit -m "hotfix: critical issue"
   git checkout master
   git merge hotfix/critical-fix
   # Create new patch release (e.g., v1.1.2)
   ```

## Environment Variables

Pastikan environment variables berikut sudah dikonfigurasi di GitHub Secrets:

### Production

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Staging (Optional)

- `STAGING_DATABASE_URL`
- `STAGING_CLERK_PUBLISHABLE_KEY`
- `STAGING_CLERK_SECRET_KEY`

## Monitoring

Setelah deployment:

1. **Health Check**: Workflow otomatis cek https://split-bill-mu.vercel.app/
2. **Manual Verification**:
   - Test login functionality
   - Test core features (create group, add expense)
   - Check database connectivity
3. **Monitor Logs**: Check Vercel dashboard untuk errors

## Best Practices

1. **Testing**: Selalu test di staging sebelum release
2. **Documentation**: Update changelog dan release notes
3. **Communication**: Inform tim tentang breaking changes
4. **Backup**: Pastikan database backup sebelum major release
5. **Gradual Rollout**: Consider feature flags untuk fitur besar

## Troubleshooting

### Common Issues

1. **Build Failed**

   - Check environment variables
   - Verify dependencies di package.json
   - Check TypeScript errors

2. **Deployment Failed**

   - Verify Vercel configuration
   - Check secrets configuration
   - Review deployment logs

3. **Health Check Failed**
   - Check application startup
   - Verify database connection
   - Check external service dependencies
