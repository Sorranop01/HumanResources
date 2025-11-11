# ⚡ Quick Deploy Reference

## 🚀 First Time Setup (5 นาที)

```bash
# 1. Get Firebase CI Token
firebase login:ci
# Copy token ที่ได้

# 2. Add to GitHub Secrets
# Go to: Settings > Secrets and variables > Actions
# Add: FIREBASE_TOKEN = <your_token>

# 3. Add Firebase Config Secrets
# DEV_FIREBASE_API_KEY, DEV_FIREBASE_AUTH_DOMAIN, etc.
# PROD_FIREBASE_API_KEY, PROD_FIREBASE_AUTH_DOMAIN, etc.
```

---

## 🎯 Deploy Commands

### Deploy to Development
```bash
git checkout develop
git pull
git push
# Auto-deploys via GitHub Actions
```

### Deploy to Production
```bash
# Option 1: Via Pull Request (Recommended)
git checkout -b release/v1.0.0
git push origin release/v1.0.0
# Create PR: develop → main
# Merge = Auto-deploy

# Option 2: Direct push (use with caution)
git checkout main
git merge develop
git push
```

### Manual Deploy (Local)
```bash
# Development
firebase use dev
pnpm build && firebase deploy

# Production
firebase use production
pnpm build && firebase deploy
```

---

## 📋 GitHub Secrets Needed

### Required
```
FIREBASE_TOKEN

# Development
DEV_FIREBASE_API_KEY
DEV_FIREBASE_AUTH_DOMAIN
DEV_FIREBASE_PROJECT_ID
DEV_FIREBASE_STORAGE_BUCKET
DEV_FIREBASE_MESSAGING_SENDER_ID
DEV_FIREBASE_APP_ID

# Production
PROD_FIREBASE_API_KEY
PROD_FIREBASE_AUTH_DOMAIN
PROD_FIREBASE_PROJECT_ID
PROD_FIREBASE_STORAGE_BUCKET
PROD_FIREBASE_MESSAGING_SENDER_ID
PROD_FIREBASE_APP_ID
```

---

## 🔍 Check Deployment Status

```bash
# GitHub Actions
https://github.com/your-username/HumanResources/actions

# Firebase Console
https://console.firebase.google.com/project/human-b4c2c/hosting
```

---

## 🐛 Quick Fixes

### Build Fails
```bash
# Check locally first
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

### Deployment Hangs
```bash
# Check Firebase token is valid
firebase login:ci
# Update FIREBASE_TOKEN in GitHub Secrets
```

### Wrong Environment Deployed
```bash
# Check branch
git branch

# Development = develop branch
# Production = main branch
```

---

## 📱 Quick URLs

- **Development**: https://human-b3c1c-dev.web.app
- **Production**: https://human-b4c2c.web.app
- **Firebase Console**: https://console.firebase.google.com
- **GitHub Actions**: https://github.com/your-username/HumanResources/actions

---

## ⏱️ Deployment Times

- **CI Checks**: ~3-5 minutes
- **Development Deploy**: ~5-7 minutes
- **Production Deploy**: ~5-7 minutes
- **Functions Deploy**: ~2-3 minutes

---

**ดูรายละเอียดเพิ่มเติม:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
