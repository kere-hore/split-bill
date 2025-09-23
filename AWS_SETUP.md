# AWS Setup Guide for Split Bill Application

This guide explains how to set up AWS services for the Split Bill Application, including S3 for file storage and caching, and CloudFront for global CDN.

## 📋 Overview

The Split Bill Application uses AWS services for:
- **S3**: File storage for receipts and cache storage for public APIs
- **CloudFront**: Global CDN for fast content delivery and API caching
- **IAM**: Secure access management for AWS resources

## 🚀 Prerequisites

- AWS Account with billing enabled
- AWS CLI installed and configured
- Basic understanding of AWS services

## 📦 S3 Bucket Setup

### 1. Create S3 Bucket
```bash
# Create bucket for Split Bill cache and files
aws s3 mb s3://split-bill-cache --region ap-southeast-1
```

### 2. Configure Bucket Policy
Create bucket policy for CloudFront access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::split-bill-cache/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

### 3. Enable Versioning (Optional)
```bash
aws s3api put-bucket-versioning \
  --bucket split-bill-cache \
  --versioning-configuration Status=Enabled
```

## 🌐 CloudFront Distribution Setup

### 1. Create Distribution
```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### 2. CloudFront Configuration
Create `cloudfront-config.json`:

```json
{
  "CallerReference": "split-bill-cdn-2024",
  "Comment": "Split Bill Application CDN",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 2,
    "Items": [
      {
        "Id": "S3-split-bill-cache",
        "DomainName": "split-bill-cache.s3.ap-southeast-1.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      },
      {
        "Id": "API-split-bill",
        "DomainName": "split-bill-mu.vercel.app",
        "CustomOriginConfig": {
          "HTTPPort": 443,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "API-split-bill",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": {
        "Forward": "all"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 300,
    "MaxTTL": 3600
  },
  "CacheBehaviors": {
    "Quantity": 1,
    "Items": [
      {
        "PathPattern": "/api/public/*",
        "TargetOriginId": "S3-split-bill-cache",
        "ViewerProtocolPolicy": "redirect-to-https",
        "ForwardedValues": {
          "QueryString": false,
          "Cookies": {
            "Forward": "none"
          }
        },
        "MinTTL": 300,
        "DefaultTTL": 3600,
        "MaxTTL": 86400
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_All"
}
```

### 3. Configure Cache Behaviors
- **Default**: Forward all requests to Vercel app
- **`/api/public/*`**: Serve from S3 cache with long TTL
- **Static Assets**: Serve from S3 with aggressive caching

## 🔐 IAM Setup

### 1. Create IAM Policy
Create policy for Split Bill application access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::split-bill-cache/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
    }
  ]
}
```

### 2. Create IAM User
```bash
# Create IAM user for Split Bill application
aws iam create-user --user-name split-bill-app

# Attach policy to user
aws iam attach-user-policy \
  --user-name split-bill-app \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/SplitBillAppPolicy

# Create access keys
aws iam create-access-key --user-name split-bill-app
```

## ⚙️ Environment Configuration

### 1. Vercel Environment Variables
Add these to your Vercel deployment:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=split-bill-cache
CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
NEXT_PUBLIC_CLOUDFRONT_URL=https://your-domain.cloudfront.net

# Cache Configuration
BROWSER_CACHE_SECONDS=300
CLOUDFRONT_CACHE_SECONDS=3600
```

### 2. Local Development
Add to `.env.local`:

```env
# AWS Configuration (for local development)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=split-bill-cache
CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
NEXT_PUBLIC_CLOUDFRONT_URL=https://your-domain.cloudfront.net
```

## 🧪 Testing Setup

### 1. Test S3 Upload
```bash
# Test file upload
aws s3 cp test-file.json s3://split-bill-cache/test/

# Test file download
aws s3 cp s3://split-bill-cache/test/test-file.json ./downloaded-file.json
```

### 2. Test CloudFront Cache
```bash
# Test cache hit
curl -I https://your-domain.cloudfront.net/api/public/groups/test-id

# Check cache headers
curl -H "X-Cache-Debug: true" https://your-domain.cloudfront.net/api/public/groups/test-id
```

### 3. Test Cache Invalidation
```bash
# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/api/public/groups/*"
```

## 📊 Monitoring and Logging

### 1. CloudWatch Metrics
Monitor these metrics:
- **S3**: Request count, error rate, data transfer
- **CloudFront**: Cache hit ratio, origin latency, error rate

### 2. Cost Optimization
- Use appropriate S3 storage class
- Configure CloudFront price class based on usage
- Set up billing alerts

### 3. Security Best Practices
- Enable S3 bucket encryption
- Use least privilege IAM policies
- Enable CloudTrail for audit logging
- Regular access key rotation

## 🚨 Troubleshooting

### Common Issues

#### 1. 403 Forbidden from S3
- Check bucket policy
- Verify IAM permissions
- Ensure correct region configuration

#### 2. CloudFront Cache Not Working
- Verify cache behaviors
- Check origin configuration
- Test cache headers

#### 3. Invalidation Not Working
- Check IAM permissions for CloudFront
- Verify distribution ID
- Wait for invalidation completion

### Debug Commands
```bash
# Check S3 bucket policy
aws s3api get-bucket-policy --bucket split-bill-cache

# List CloudFront distributions
aws cloudfront list-distributions

# Check invalidation status
aws cloudfront get-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --id INVALIDATION_ID
```

## 📚 Resources

### AWS Documentation
- [S3 User Guide](https://docs.aws.amazon.com/s3/)
- [CloudFront Developer Guide](https://docs.aws.amazon.com/cloudfront/)
- [IAM User Guide](https://docs.aws.amazon.com/iam/)

### Split Bill Specific
- [Cache Strategy Documentation](./.amazonq/rules/architecture-patterns.md)
- [API Documentation](./src/app/docs/page.tsx)
- [Deployment Guide](./README.md#deployment)

---

This AWS setup provides a robust, scalable infrastructure for the Split Bill Application with global CDN, efficient caching, and secure access management.