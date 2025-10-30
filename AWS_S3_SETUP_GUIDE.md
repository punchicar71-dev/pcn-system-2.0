# AWS S3 Bucket Setup Guide for PCN Vehicle System

Complete guide for setting up AWS S3 bucket for storing vehicle images, 360° images, and CR/Paper documents.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create AWS Account](#create-aws-account)
3. [Create IAM User](#create-iam-user)
4. [Create S3 Bucket](#create-s3-bucket)
5. [Configure Bucket Permissions](#configure-bucket-permissions)
6. [Configure CORS](#configure-cors)
7. [Setup Lifecycle Rules (Optional)](#setup-lifecycle-rules-optional)
8. [Update Application Configuration](#update-application-configuration)
9. [Test Upload](#test-upload)
10. [Cost Optimization](#cost-optimization)
11. [Security Best Practices](#security-best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- AWS Account (free tier available)
- Credit card for AWS account verification
- Access to your project's `.env` files

---

## 1. Create AWS Account

1. **Visit AWS Console:**
   - Go to [https://aws.amazon.com](https://aws.amazon.com)
   - Click "Create an AWS Account"

2. **Fill in Account Details:**
   - Email address
   - Password
   - AWS account name (e.g., "PCN Vehicle System")

3. **Choose Support Plan:**
   - Select "Basic Support - Free" for development

4. **Complete Registration:**
   - Verify email
   - Add payment method (required, but free tier available)
   - Verify phone number

---

## 2. Create IAM User

Creating a dedicated IAM user with limited permissions is a security best practice.

### Step 2.1: Navigate to IAM

1. Log in to [AWS Console](https://console.aws.amazon.com)
2. Search for "IAM" in the services search bar
3. Click on "IAM" (Identity and Access Management)

### Step 2.2: Create New User

1. Click "Users" in the left sidebar
2. Click "Add users" button
3. **User details:**
   - Username: `pcn-vehicle-s3-user`
   - Select: "Access key - Programmatic access"
4. Click "Next: Permissions"

### Step 2.3: Set Permissions

1. Click "Attach existing policies directly"
2. Search for and select: `AmazonS3FullAccess`
   - ⚠️ **Note:** For production, create a custom policy with restricted permissions
3. Click "Next: Tags" (optional, skip)
4. Click "Next: Review"
5. Click "Create user"

### Step 2.4: Save Access Keys

**⚠️ CRITICAL: You will only see these once!**

- **Access Key ID:** `AKIA...` (copy this)
- **Secret Access Key:** `wJalr...` (copy this)

Save these in a secure location immediately. You'll need them for your `.env` files.

---

## 3. Create S3 Bucket

### Step 3.1: Navigate to S3

1. In AWS Console, search for "S3"
2. Click "S3" service

### Step 3.2: Create Bucket

1. Click "Create bucket"
2. **Bucket settings:**

```
Bucket name: pcn-vehicle-images
  - Must be globally unique
  - Lowercase only
  - No spaces
  - Examples:
    - pcn-vehicle-images-prod
    - your-company-vehicle-images
    - pcn-vehicles-2025

AWS Region: ap-south-1 (Asia Pacific - Mumbai)
  - Choose region closest to your users
  - For Sri Lanka, use Mumbai (ap-south-1)

Object Ownership: ACLs disabled (recommended)

Block Public Access settings:
  ⬜ Block all public access
  - UNCHECK THIS for public image access
  - Check "I acknowledge..." warning

Bucket Versioning: Disabled (or Enabled for backup)

Tags (Optional):
  - Key: Project, Value: PCN Vehicle System
  - Key: Environment, Value: Production

Default encryption: 
  ✓ Enable
  - Encryption type: Amazon S3-managed keys (SSE-S3)

Advanced settings:
  - Object Lock: Disabled
```

3. Click "Create bucket"

---

## 4. Configure Bucket Permissions

### Step 4.1: Bucket Policy

1. Click on your bucket name (`pcn-vehicle-images`)
2. Go to "Permissions" tab
3. Scroll to "Bucket policy"
4. Click "Edit"
5. Paste the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::pcn-vehicle-images/*"
    }
  ]
}
```

**⚠️ Important:** Replace `pcn-vehicle-images` with your actual bucket name.

6. Click "Save changes"

### Step 4.2: Access Control List (ACL)

1. In "Permissions" tab, go to "Access Control List (ACL)"
2. Ensure public read access is enabled for objects

---

## 5. Configure CORS

CORS (Cross-Origin Resource Sharing) allows your Next.js application to upload files directly to S3.

### Step 5.1: Add CORS Configuration

1. Click on your bucket
2. Go to "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste the following configuration:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://localhost:3001",
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

**Replace:**
- Add your production domain to `AllowedOrigins`
- Keep localhost URLs for development

6. Click "Save changes"

---

## 6. Setup Lifecycle Rules (Optional)

Automatically delete temporary/unused files to save costs.

### Step 6.1: Create Lifecycle Rule

1. Go to "Management" tab
2. Click "Create lifecycle rule"
3. **Rule configuration:**

```
Lifecycle rule name: delete-temp-files

Choose a rule scope:
  ⦿ Limit the scope using one or more filters
  - Prefix: temp/

Lifecycle rule actions:
  ✓ Expire current versions of objects
  - Days after object creation: 7

  ✓ Delete expired object delete markers or incomplete multipart uploads
```

4. Click "Create rule"

---

## 7. Update Application Configuration

### Step 7.1: Update Dashboard `.env.local`

Edit `/dashboard/.env.local`:

```bash
# Existing Supabase config...
NEXT_PUBLIC_SUPABASE_URL=https://wnorajpknqegnnmeotjf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API URL for S3 uploads
NEXT_PUBLIC_API_URL=http://localhost:4000

# AWS S3 Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...your-access-key...
AWS_SECRET_ACCESS_KEY=wJalr...your-secret-key...
AWS_S3_BUCKET_NAME=pcn-vehicle-images
NEXT_PUBLIC_S3_BASE_URL=https://pcn-vehicle-images.s3.ap-south-1.amazonaws.com
```

### Step 7.2: Update API `.env`

Edit `/api/.env`:

```bash
# AWS S3 Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...your-access-key...
AWS_SECRET_ACCESS_KEY=wJalr...your-secret-key...
AWS_S3_BUCKET_NAME=pcn-vehicle-images

# Supabase Configuration
SUPABASE_URL=https://wnorajpknqegnnmeotjf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Configuration
PORT=4000
NODE_ENV=development
```

### Step 7.3: Folder Structure in S3

Your bucket will have this structure:

```
pcn-vehicle-images/
├── vehicles/
│   ├── {vehicle-id}/
│   │   ├── gallery/
│   │   │   ├── image-1.jpg
│   │   │   ├── image-2.jpg
│   │   │   └── ...
│   │   ├── 360/
│   │   │   ├── frame-001.jpg
│   │   │   ├── frame-002.jpg
│   │   │   └── ...
│   │   └── documents/
│   │       ├── cr-image-1.jpg
│   │       ├── registration.pdf
│   │       └── ...
└── temp/
    └── (temporary uploads, auto-deleted after 7 days)
```

---

## 8. Test Upload

### Step 8.1: Test from Dashboard

1. Start your application:
   ```bash
   cd "/Users/asankaherath/Projects/PCN System . 2.0"
   npm run dev
   ```

2. Navigate to: http://localhost:3001/add-vehicle

3. **Upload test images:**
   - Upload a vehicle image
   - Upload a 360° image
   - Upload a CR/Paper image

4. **Verify in AWS Console:**
   - Go to S3 Console
   - Click on your bucket
   - Navigate to `vehicles/` folder
   - Check if files are uploaded

### Step 8.2: Test Public Access

1. Click on an uploaded image in S3
2. Copy the "Object URL"
3. Open in new browser tab
4. Image should display (if public access configured correctly)

Example URL:
```
https://pcn-vehicle-images.s3.ap-south-1.amazonaws.com/vehicles/abc123/gallery/image-1.jpg
```

---

## 9. Cost Optimization

### Storage Pricing (ap-south-1 - Mumbai)

| Storage Type | Cost per GB/month |
|-------------|-------------------|
| Standard | $0.025 |
| Standard-IA | $0.0125 |
| Glacier | $0.005 |

### Estimated Monthly Costs

**Scenario 1: Small Business (100 vehicles)**
- Storage: 100 vehicles × 10 images × 2MB = 2GB
- Requests: 10,000 GET requests
- Data Transfer: 20GB out
- **Total: ~$2-3/month**

**Scenario 2: Medium Business (500 vehicles)**
- Storage: 500 vehicles × 10 images × 2MB = 10GB
- Requests: 50,000 GET requests
- Data Transfer: 100GB out
- **Total: ~$10-12/month**

### Cost Saving Tips

1. **Enable Lifecycle Rules:**
   - Move old images to Standard-IA after 30 days
   - Archive to Glacier after 90 days

2. **Optimize Images:**
   - Compress images before upload
   - Use appropriate formats (JPEG for photos, PNG for documents)
   - Recommended size: < 500KB per image

3. **Use CloudFront CDN (Optional):**
   - Reduces data transfer costs
   - Improves global loading speed
   - First 1TB free per month

---

## 10. Security Best Practices

### 10.1: Restrict IAM Permissions

Instead of `AmazonS3FullAccess`, use this custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::pcn-vehicle-images",
        "arn:aws:s3:::pcn-vehicle-images/*"
      ]
    }
  ]
}
```

### 10.2: Environment Variables

**Never commit these to Git:**
- ✅ Add to `.env.local` (already in `.gitignore`)
- ❌ Never commit `.env.local` to repository
- ✅ Use environment variables in production hosting

### 10.3: Bucket Encryption

- ✅ Enable default encryption (already configured)
- ✅ Use SSE-S3 (free) or SSE-KMS (paid, more control)

### 10.4: Access Logging

Enable S3 access logging for audit trail:

1. Go to bucket "Properties"
2. Enable "Server access logging"
3. Choose destination bucket for logs

### 10.5: Versioning (Recommended for Production)

Enable versioning to protect against accidental deletions:

1. Go to bucket "Properties"
2. Enable "Bucket Versioning"
3. Old versions retained (can be restored)

---

## 11. Troubleshooting

### Issue 1: Upload Fails - "Access Denied"

**Cause:** Incorrect IAM permissions

**Solution:**
1. Check IAM user has S3 permissions
2. Verify bucket policy allows uploads
3. Check AWS credentials in `.env` files

### Issue 2: Images Not Loading - CORS Error

**Cause:** CORS not configured or incorrect origins

**Solution:**
1. Check CORS configuration in S3
2. Verify your domain is in `AllowedOrigins`
3. Clear browser cache

### Issue 3: "Bucket does not exist"

**Cause:** Bucket name mismatch

**Solution:**
1. Verify bucket name in `.env` matches AWS
2. Check region is correct
3. Bucket names are case-sensitive

### Issue 4: High Costs

**Cause:** Too many requests or large data transfer

**Solution:**
1. Enable CloudFront CDN
2. Implement image caching
3. Compress images
4. Set up lifecycle rules

### Issue 5: Slow Upload Speed

**Cause:** Large file sizes or network issues

**Solution:**
1. Compress images before upload
2. Use multipart upload for files > 5MB
3. Choose AWS region closer to users

---

## 12. Production Deployment Checklist

Before going live:

- [ ] Create production S3 bucket (separate from development)
- [ ] Configure IAM user with restricted permissions
- [ ] Enable bucket encryption
- [ ] Configure CORS with production domain
- [ ] Set up lifecycle rules
- [ ] Enable access logging
- [ ] Enable versioning
- [ ] Test all upload types (gallery, 360°, documents)
- [ ] Set up CloudFront CDN (optional but recommended)
- [ ] Configure backup/disaster recovery
- [ ] Document AWS credentials securely
- [ ] Set up billing alerts
- [ ] Review security settings

---

## Quick Reference Commands

### AWS CLI Setup (Optional)

```bash
# Install AWS CLI
brew install awscli  # macOS
# or
pip install awscli  # Python

# Configure AWS CLI
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: ap-south-1
# - Default output format: json

# Test connection
aws s3 ls

# List bucket contents
aws s3 ls s3://pcn-vehicle-images/

# Upload file manually
aws s3 cp image.jpg s3://pcn-vehicle-images/test/

# Download file
aws s3 cp s3://pcn-vehicle-images/test/image.jpg ./
```

---

## Support & Resources

### AWS Documentation
- [S3 User Guide](https://docs.aws.amazon.com/s3/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [S3 Pricing Calculator](https://calculator.aws/#/addService/S3)

### Contact
- AWS Support: https://aws.amazon.com/support/
- PCN System Issues: Create an issue in the repository

---

## Appendix: Environment Variables Template

### Dashboard `.env.local` Template

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# AWS S3 Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_S3_BASE_URL=https://your-bucket-name.s3.ap-south-1.amazonaws.com
```

### API `.env` Template

```bash
# AWS S3 Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=your-bucket-name

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=4000
NODE_ENV=development
```

---

**Last Updated:** October 30, 2025  
**Version:** 1.0  
**Author:** PCN Vehicle System Development Team
