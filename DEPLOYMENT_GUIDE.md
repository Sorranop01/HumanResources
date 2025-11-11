# 🚀 Deployment Guide - HumanResources

คู่มือการ Deploy โปรเจกต์ไปยัง Firebase Hosting และ Cloud Functions

---

## 📋 Pre-requisites

### 1. Firebase Projects
ต้องมี Firebase Projects พร้อมแล้ว:
- **Development**: `human-b3c1c-dev`
- **Staging**: `human-b4c2c` (staging)
- **Production**: `human-b4c2c` (production)

### 2. Firebase Token
สร้าง Firebase CI token:
```bash
firebase login:ci
```
Copy token ที่ได้ไว้ใช้ในขั้นตอนถัดไป

### 3. GitHub Repository
Push โค้ดไปยัง GitHub repository

---

## 🔐 Setup GitHub Secrets

ไปที่ **Settings > Secrets and variables > Actions** แล้วเพิ่ม secrets:

### Required Secrets

#### Firebase Token
```
FIREBASE_TOKEN=your_firebase_ci_token_here
```

#### Development Environment
```
DEV_FIREBASE_API_KEY=your_dev_api_key
DEV_FIREBASE_AUTH_DOMAIN=human-b3c1c-dev.firebaseapp.com
DEV_FIREBASE_PROJECT_ID=human-b3c1c-dev
DEV_FIREBASE_STORAGE_BUCKET=human-b3c1c-dev.appspot.com
DEV_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
DEV_FIREBASE_APP_ID=your_dev_app_id
```

#### Production Environment
```
PROD_FIREBASE_API_KEY=your_prod_api_key
PROD_FIREBASE_AUTH_DOMAIN=human-b4c2c.firebaseapp.com
PROD_FIREBASE_PROJECT_ID=human-b4c2c
PROD_FIREBASE_STORAGE_BUCKET=human-b4c2c.appspot.com
PROD_FIREBASE_MESSAGING_SENDER_ID=your_prod_sender_id
PROD_FIREBASE_APP_ID=your_prod_app_id
```

#### Optional: Security Scanning
```
SNYK_TOKEN=your_snyk_token (optional)
```

---

## 🌿 Branch Strategy

```
main          → Production deployment
  ↑
develop       → Development deployment
  ↑
feature/*     → CI checks only (no deployment)
```

### Branch Rules

1. **`main` branch**
   - Protected branch
   - Requires PR approval
   - Requires CI checks to pass
   - Auto-deploys to **Production**

2. **`develop` branch**
   - Protected branch
   - Requires PR approval (optional)
   - Auto-deploys to **Development**

3. **Feature branches**
   - Pattern: `feature/your-feature-name`
   - Runs CI checks only
   - No deployment

---

## 📦 Deployment Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**
- ✅ Lint & Type Check
- ✅ Unit Tests
- ✅ Build Application
- ✅ Build Cloud Functions

### 2. Development Deployment (`.github/workflows/deploy-development.yml`)

**Triggers:**
- Push to `develop` branch
- Manual trigger via GitHub Actions UI

**Deploys to:**
- Firebase Hosting (Development)
- Cloud Functions (Development)

**URL:** `https://human-b3c1c-dev.web.app`

### 3. Production Deployment (`.github/workflows/deploy-production.yml`)

**Triggers:**
- Push to `main` branch
- Git tags `v*` (e.g., `v1.0.0`)
- Manual trigger via GitHub Actions UI

**Deploys to:**
- Firebase Hosting (Production)
- Cloud Functions (Production)

**URL:** `https://human-b4c2c.web.app`

### 4. Security Audit (`.github/workflows/security-audit.yml`)

**Triggers:**
- Every Monday at midnight (scheduled)
- Push to `main` or `develop`
- Manual trigger

**Checks:**
- npm/pnpm audit
- Snyk security scan (if configured)

---

## 🎯 Deployment Process

### Deploying to Development

1. **Create feature branch**
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

3. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**
   - Base: `develop`
   - Compare: `feature/your-feature-name`
   - Wait for CI checks to pass
   - Request review (optional)
   - Merge PR

5. **Auto-deployment**
   - Merging to `develop` triggers automatic deployment
   - Check GitHub Actions tab for deployment status
   - Access at: `https://human-b3c1c-dev.web.app`

### Deploying to Production

1. **Create release PR**
   ```bash
   git checkout develop
   git pull
   git checkout -b release/v1.0.0
   ```

2. **Update version (optional)**
   ```bash
   # Update package.json version
   npm version patch  # or minor, major
   ```

3. **Push and create PR**
   ```bash
   git push origin release/v1.0.0
   ```
   - Base: `main`
   - Compare: `release/v1.0.0`

4. **Review and merge**
   - Get approval from team
   - Ensure all CI checks pass
   - Merge to `main`

5. **Auto-deployment**
   - Merging to `main` triggers production deployment
   - Access at: `https://human-b4c2c.web.app`

6. **Create Git tag (optional)**
   ```bash
   git checkout main
   git pull
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```
   - This creates a GitHub Release automatically

---

## 🔧 Manual Deployment

### Local Deployment (without GitHub Actions)

#### Deploy to Development
```bash
# Build
pnpm build

# Deploy hosting
firebase use dev
firebase deploy --only hosting

# Deploy functions
cd functions
npm run build
cd ..
firebase deploy --only functions
```

#### Deploy to Production
```bash
# Build
pnpm build

# Deploy hosting
firebase use production
firebase deploy --only hosting

# Deploy functions
cd functions
npm run build
cd ..
firebase deploy --only functions
```

#### Deploy specific function
```bash
firebase deploy --only functions:functionName
```

#### Deploy Firestore rules & indexes
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## 🔍 Monitoring Deployments

### Check Deployment Status

1. **GitHub Actions Tab**
   - Go to repository → Actions
   - See all workflow runs
   - Click on specific run for details

2. **Firebase Console**
   - Go to Firebase Console
   - Select project
   - Check Hosting → Release history
   - Check Functions → Logs

### Rollback Deployment

#### Hosting Rollback
```bash
# List hosting releases
firebase hosting:channel:list

# Rollback to specific version
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID DESTINATION_SITE_ID
```

#### Functions Rollback
- Firebase doesn't support automatic rollback
- Deploy previous version manually
- Or use git revert + push

---

## 🐛 Troubleshooting

### Build Fails

**Error: Missing environment variables**
```
Solution: Check GitHub Secrets are set correctly
```

**Error: TypeScript compilation failed**
```
Solution: Run `pnpm typecheck` locally first
```

### Deployment Fails

**Error: FIREBASE_TOKEN is invalid**
```
Solution: Generate new token with `firebase login:ci`
Update FIREBASE_TOKEN in GitHub Secrets
```

**Error: Permission denied**
```
Solution: Check Firebase project permissions
Ensure service account has deployment rights
```

**Error: Functions deployment timeout**
```
Solution:
1. Check function size (max 10MB)
2. Reduce dependencies
3. Increase timeout in firebase.json
```

### Performance Issues

**Slow initial load**
```
Solutions:
1. Enable Gzip compression (already configured)
2. Check bundle size: pnpm build && ls -lh dist/
3. Analyze bundle: pnpm run analyze
```

---

## 📊 CI/CD Pipeline Overview

```
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  Lint & Type Check              │
│  - Biome linting                │
│  - TypeScript checking          │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Run Tests                      │
│  - Unit tests                   │
│  - Coverage report              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Build                          │
│  - Frontend (Vite)              │
│  - Functions (TypeScript)       │
└──────┬──────────────────────────┘
       │
       ├─────────── develop ────────┐
       │                             ▼
       │                    ┌────────────────┐
       │                    │  Deploy to Dev │
       │                    └────────────────┘
       │
       └─────────── main ───────────┐
                                     ▼
                            ┌────────────────┐
                            │  Deploy to Prod│
                            └────────────────┘
```

---

## ✅ Deployment Checklist

### Before First Deployment

- [ ] Firebase projects created (dev, staging, prod)
- [ ] GitHub Secrets configured
- [ ] Firebase Token generated and added
- [ ] `.firebaserc` updated with correct project IDs
- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] Branch protection rules set up

### Before Each Production Deployment

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Staging deployment tested
- [ ] Breaking changes documented
- [ ] Database migrations prepared (if needed)
- [ ] Rollback plan ready

### After Deployment

- [ ] Verify deployment in Firebase Console
- [ ] Test critical user flows
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Update documentation (if needed)

---

## 📚 Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase CI/CD Best Practices](https://firebase.google.com/docs/hosting/github-integration)

---

## 🆘 Support

หากพบปัญหา:
1. Check GitHub Actions logs
2. Check Firebase Console logs
3. Review this guide
4. Contact team lead

---

**Last Updated:** 2025-11-11
