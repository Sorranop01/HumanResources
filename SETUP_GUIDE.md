# 🚀 HumanResources - Setup Guide

คู่มือการติดตั้งและเริ่มต้นใช้งานระบบ HumanResources

## 📋 Prerequisites (สิ่งที่ต้องมี)

1. **Node.js >= 20.0.0**
   ```bash
   node --version
   ```

2. **pnpm >= 10.0.0**
   ```bash
   npm install -g pnpm
   pnpm --version
   ```

3. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase --version
   ```

4. **Firebase Project**
   - สร้าง Firebase Project ที่ [Firebase Console](https://console.firebase.google.com/)
   - เปิดใช้งาน Authentication, Firestore, Storage

---

## 🔧 Installation Steps

### 1. Clone Repository & Install Dependencies

```bash
# Navigate to project directory
cd HumanResources

# Install frontend dependencies
pnpm install

# Install functions dependencies
cd functions
npm install
cd ..
```

### 2. Firebase Configuration

#### 2.1 Login to Firebase
```bash
firebase login
```

#### 2.2 Set Active Project
```bash
# List your projects
firebase projects:list

# Set active project
firebase use human-b4c2c
```

#### 2.3 Update `.firebaserc`
แก้ไขไฟล์ `.firebaserc`:
```json
{
  "projects": {
    "default": "human-b5c9c",
    "dev": "human-b3c1c-dev",
    "staging": "human-b4c2c",
    "production": "human-b4c2c.web.app"
  }
}
```

### 3. Environment Configuration

#### 3.1 Copy Example File
```bash
cp .env.example .env.development
```

#### 3.2 Get Firebase Config
1. ไปที่ Firebase Console > Project Settings > General
2. Scroll ลงมาที่ "Your apps"
3. Click "Web app" (หรือสร้างใหม่ถ้ายังไม่มี)
4. Copy configuration values

#### 3.3 Update `.env.development`
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ENV=development
```

### 4. Firestore Setup

#### 4.1 Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

#### 4.2 Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### 5. Start Development

#### Option A: Local Development (Recommended)
```bash
# Terminal 1: Start Frontend
pnpm dev

# Terminal 2: Start Firebase Emulators
pnpm emulators
```

เปิดเบราว์เซอร์:
- Frontend: http://localhost:5173
- Firebase Emulator UI: http://localhost:4000

#### Option B: Connect to Real Firebase
```bash
pnpm dev
```

---

## 🏗️ Project Structure

```
HumanResources/
├─ src/                       # Frontend source
│  ├─ app/                    # App setup (providers, router)
│  ├─ domains/                # Business domains (FSD/DDD)
│  │  ├─ people/             # พนักงาน
│  │  ├─ payroll/            # เงินเดือน
│  │  ├─ attendance/         # เวลาทำงาน
│  │  └─ system/             # ระบบ (auth, rbac)
│  ├─ shared/                # Shared resources
│  │  ├─ ui/                 # UI components
│  │  ├─ lib/                # Utilities (firebase, date, format)
│  │  ├─ hooks/              # Custom hooks
│  │  ├─ stores/             # Zustand stores
│  │  ├─ types/              # TypeScript types
│  │  └─ constants/          # Constants (routes, roles)
│  ├─ env.ts                 # Environment config
│  └─ main.tsx               # Entry point
├─ functions/                 # Cloud Functions
│  └─ src/
│     ├─ config/             # Firebase Admin, constants
│     ├─ middleware/         # Auth, RBAC
│     ├─ utils/              # Logger, errors
│     └─ api/                # Business logic
├─ public/                    # Static assets
├─ .env.development          # Environment variables
├─ package.json              # Frontend dependencies
├─ vite.config.ts            # Vite configuration
├─ tsconfig.json             # TypeScript configuration
├─ biome.json                # Code linting & formatting
├─ firebase.json             # Firebase configuration
└─ firestore.rules           # Firestore security rules
```

---

## 🧪 Testing

### Run Tests
```bash
pnpm test
```

### Run Tests with Coverage
```bash
pnpm test:coverage
```

### Run Tests with UI
```bash
pnpm test:ui
```

---

## 📦 Building & Deployment

### Build Frontend
```bash
pnpm build
```

### Preview Production Build
```bash
pnpm preview
```

### Deploy to Firebase

#### Deploy Everything
```bash
firebase deploy
```

#### Deploy Hosting Only
```bash
pnpm deploy:hosting:dev
```

#### Deploy Functions Only
```bash
pnpm deploy:functions:dev
```

---

## 🛠️ Development Workflow

### 1. Create New Feature

```bash
# สร้าง feature ใหม่ใน domain ที่เหมาะสม
# ตัวอย่าง: สร้าง feature "candidates" ใน people domain

mkdir -p src/domains/people/features/candidates/{components,hooks,services}
```

### 2. Follow FSD/DDD Structure

```
src/domains/<domain>/features/<feature>/
├─ components/    # React components
├─ hooks/         # Custom hooks (TanStack Query)
├─ services/      # API/Firestore services
└─ types/         # TypeScript types (if needed)
```

### 3. Use Path Aliases

```typescript
// ✅ Correct
import { auth } from '@/shared/lib/firebase';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';

// ❌ Wrong
import { auth } from '../../../shared/lib/firebase';
```

### 4. Follow Golden Rules

1. **No `any` type** - ใช้ proper types
2. **Server State = TanStack Query only** - ไม่ใช้ useEffect+useState สำหรับ data fetching
3. **Buttons must have type** - `<button type="button">` or `type="submit"`
4. **Cloud Functions must use region** - `asia-southeast1`

### 5. Lint & Format

```bash
# Check
pnpm lint

# Fix
pnpm lint:fix

# Format
pnpm format
```

### 6. Type Check

```bash
pnpm typecheck
```

---

## 🔐 RBAC Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **admin** | ผู้ดูแลระบบ | Full access |
| **hr** | ฝ่ายทรัพยากรบุคคล | Employees, Payroll, Attendance |
| **manager** | ผู้จัดการ | Team management, Approve leaves |
| **employee** | พนักงาน | Self-service (attendance, leaves) |
| **auditor** | ผู้ตรวจสอบ | Read-only access to logs |

---

## 📚 Additional Resources

- [AI.md](./AI.md) - System prompt & development guidelines
- [README.md](./README.md) - Project overview
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Ant Design Documentation](https://ant.design/)

---

## ❓ Troubleshooting

### ปัญหา: Firebase not initialized
**วิธีแก้:** ตรวจสอบว่าคุณ copy `.env.example` เป็น `.env.development` และกรอก Firebase config ครบถ้วน

### ปัญหา: Port 5173 already in use
**วิธีแก้:**
```bash
# Kill process
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.ts
```

### ปัญหา: pnpm command not found
**วิธีแก้:**
```bash
npm install -g pnpm
```

### ปัญหา: Firestore permissions denied
**วิธีแก้:** Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

---

## 🎉 เสร็จสิ้น!

ตอนนี้คุณพร้อมใช้งานแล้ว! 🚀

เปิด http://localhost:5173 และเริ่มพัฒนาได้เลย!
