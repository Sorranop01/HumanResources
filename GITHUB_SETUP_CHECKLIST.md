# ✅ GitHub Setup Checklist

คู่มือการตั้งค่า GitHub Repository สำหรับ CI/CD

---

## 📦 Repository Settings

### 1. Create GitHub Repository
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "feat: initial commit with project foundation"

# Add remote
git remote add origin https://github.com/your-username/HumanResources.git

# Push
git branch -M main
git push -u origin main

# Create develop branch
git checkout -b develop
git push -u origin develop
```

---

## 🔐 Secrets Configuration

Go to: **Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets (ต้องมีทั้งหมด)

#### 1. Firebase CI Token
```
Name: FIREBASE_TOKEN
Value: <get from: firebase login:ci>
```

#### 2. Development Firebase Config
```
Name: DEV_FIREBASE_API_KEY
Value: AIzaSy... (from Firebase Console)

Name: DEV_FIREBASE_AUTH_DOMAIN
Value: human-b3c1c-dev.firebaseapp.com

Name: DEV_FIREBASE_PROJECT_ID
Value: human-b3c1c-dev

Name: DEV_FIREBASE_STORAGE_BUCKET
Value: human-b3c1c-dev.appspot.com

Name: DEV_FIREBASE_MESSAGING_SENDER_ID
Value: 123456789

Name: DEV_FIREBASE_APP_ID
Value: 1:123456789:web:abc123
```

#### 3. Production Firebase Config
```
Name: PROD_FIREBASE_API_KEY
Value: AIzaSy... (from Firebase Console)

Name: PROD_FIREBASE_AUTH_DOMAIN
Value: human-b4c2c.firebaseapp.com

Name: PROD_FIREBASE_PROJECT_ID
Value: human-b4c2c

Name: PROD_FIREBASE_STORAGE_BUCKET
Value: human-b4c2c.appspot.com

Name: PROD_FIREBASE_MESSAGING_SENDER_ID
Value: 987654321

Name: PROD_FIREBASE_APP_ID
Value: 1:987654321:web:xyz789
```

#### 4. Optional: Snyk Token (for security scanning)
```
Name: SNYK_TOKEN
Value: <get from: https://snyk.io>
```

---

## 🛡️ Branch Protection Rules

Go to: **Settings → Branches → Add branch protection rule**

### Protect `main` branch

```
Branch name pattern: main

✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale pull request approvals when new commits are pushed

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  Required checks:
    - Lint & Type Check
    - Unit Tests
    - Build Application
    - Build Cloud Functions

✅ Require conversation resolution before merging

✅ Do not allow bypassing the above settings
  (Unchecked for: Administrators - if you want to bypass)

✅ Allow force pushes: No
✅ Allow deletions: No
```

### Protect `develop` branch (optional but recommended)

```
Branch name pattern: develop

✅ Require status checks to pass before merging
  Required checks:
    - Lint & Type Check
    - Unit Tests

✅ Allow force pushes: No
✅ Allow deletions: No
```

---

## 🏷️ Labels Setup

Go to: **Issues → Labels → New label**

Create these labels:

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | `#d73a4a` | Something isn't working |
| `enhancement` | `#a2eeef` | New feature or request |
| `documentation` | `#0075ca` | Improvements or additions to documentation |
| `dependencies` | `#0366d6` | Pull requests that update a dependency file |
| `frontend` | `#1d76db` | Frontend changes |
| `backend` | `#db6d1d` | Backend/Functions changes |
| `ci` | `#000000` | CI/CD related |
| `security` | `#ee0701` | Security related |
| `performance` | `#0e8a16` | Performance improvements |
| `refactor` | `#fbca04` | Code refactoring |

---

## 🌿 Environments Setup

Go to: **Settings → Environments**

### Create "development" environment
```
Name: development
✅ Required reviewers: (optional)
Deployment branches: develop only
```

### Create "production" environment
```
Name: production
✅ Required reviewers: (recommended - add team members)
Deployment branches: main only
⏱️ Wait timer: 0 minutes (or set delay if needed)
```

---

## 📊 Actions Permissions

Go to: **Settings → Actions → General**

```
✅ Allow all actions and reusable workflows

Workflow permissions:
✅ Read and write permissions
✅ Allow GitHub Actions to create and approve pull requests

✅ Allow actions created by GitHub
```

---

## 🔔 Notifications Setup

Go to: **Settings → Notifications**

Recommended settings:
```
✅ Email notifications for:
  - Workflow failures
  - Security alerts
  - Dependabot alerts

✅ Slack/Discord webhook (optional)
  Add webhook URL in repository secrets
```

---

## 📝 About Section

Go to: **Repository → About (⚙️ icon)**

```
Description: HumanResources - Modern HR Management System

Website: https://human-b4c2c.web.app

Topics:
  - react
  - typescript
  - firebase
  - hr-management
  - vite
  - antd
  - tanstack-query
  - zustand
```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Repository created on GitHub
- [ ] All required secrets added (14 secrets minimum)
- [ ] Branch protection rules configured
- [ ] Labels created
- [ ] Environments set up (development, production)
- [ ] Actions permissions configured
- [ ] First push successful
- [ ] CI workflow runs successfully
- [ ] Can create Pull Request
- [ ] Branch protection blocks direct push to main

---

## 🧪 Test Your Setup

### Test CI Workflow
```bash
# Create test branch
git checkout -b test/ci-setup
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: CI setup"
git push origin test/ci-setup

# Create PR on GitHub
# Should see CI checks running ✅
```

### Test Development Deployment
```bash
# Push to develop
git checkout develop
echo "# Deploy test" >> DEPLOY_TEST.md
git add DEPLOY_TEST.md
git commit -m "test: deployment setup"
git push origin develop

# Check GitHub Actions
# Should see deployment workflow running ✅
# Check: https://human-b3c1c-dev.web.app
```

---

## 🆘 Troubleshooting

### Secrets not working
```
1. Check secret names match exactly (case-sensitive)
2. Secrets don't show their values (normal)
3. Re-create secret if needed
4. Wait 1-2 minutes after adding secrets
```

### Branch protection blocking you
```
1. Check you're not pushing directly to main
2. Create PR instead
3. Or temporarily disable protection for initial setup
```

### Workflow not triggering
```
1. Check .github/workflows files are in main/develop branch
2. Verify branch names in workflow triggers
3. Check Actions are enabled in repository settings
```

---

## 📚 Next Steps

After setup complete:

1. ✅ Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. ✅ Read [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
3. ✅ Make your first deployment
4. ✅ Invite team members
5. ✅ Start developing! 🚀

---

**Setup Time:** ~15-20 minutes
**Last Updated:** 2025-11-11
