# HumanResources - HR Admin System

Modern HR Management System built with React, TypeScript, Firebase, and FSD/DDD architecture.

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18.2 + TypeScript 5.x
- **Build Tool**: Vite 7.x
- **Routing**: React Router v6+
- **State Management**:
  - Server State: TanStack Query v5.90.2
  - UI State: Zustand 5.0.7
- **UI Library**: Ant Design 5.27 + Tailwind CSS v4
- **Icons**: Lucide React 0.542.0
- **Validation**: Zod 3.23.8

### Backend
- **Platform**: Firebase 12.x
- **Runtime**: Node.js 20 (Cloud Functions v2)
- **Region**: asia-southeast1 (MANDATORY)
- **Database**: Firestore
- **Auth**: Firebase Auth (RBAC)

### DevOps
- **Package Manager**: pnpm 10.x
- **Linting**: Biome 2.2.5
- **Testing**: Vitest 3.2.x

## 📁 Project Structure (FSD/DDD)

```
humanresources/
├─ src/
│  ├─ app/                # App-level setup
│  ├─ domains/            # Business domains (FSD/DDD)
│  │  ├─ people/          # Employees, candidates
│  │  ├─ payroll/         # Salary, deductions
│  │  ├─ attendance/      # Time tracking, leaves
│  │  └─ system/          # Auth, RBAC, settings
│  ├─ shared/             # Shared resources
│  │  ├─ ui/              # Design system
│  │  ├─ lib/             # Utilities (firebase, date, etc.)
│  │  ├─ hooks/           # Custom hooks
│  │  ├─ stores/          # Zustand stores
│  │  └─ types/           # TypeScript types
│  ├─ env.ts
│  └─ main.tsx
├─ functions/             # Cloud Functions v2
├─ public/
├─ index.html
└─ [config files]
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 10.0.0
- Firebase CLI

### Installation

1. **Clone & Install**
   ```bash
   pnpm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your Firebase credentials
   ```

3. **Start Development Server**
   ```bash
   pnpm dev
   ```

4. **Start Firebase Emulators** (Optional)
   ```bash
   pnpm emulators
   ```

## 📜 Available Scripts

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm typecheck        # Run TypeScript check
pnpm lint             # Run Biome linter
pnpm lint:fix         # Fix linting issues
pnpm test             # Run tests
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Run tests with coverage
```

## 🔐 RBAC Roles

- **admin**: Full system access
- **hr**: HR operations (employees, payroll)
- **manager**: Team management
- **employee**: Self-service
- **auditor**: Read-only access to logs

## 🎯 Golden Rules

1. ❌ **No `any` type** - Use proper types or `DocumentData`
2. ✅ **Server State = TanStack Query only** - No useEffect+useState for data fetching
3. ✅ **Path Aliases** - Use `@/` prefix (e.g., `import { ... } from '@/shared/lib/firebase'`)
4. ✅ **Strict TypeScript** - All strict mode options enabled
5. ✅ **Cloud Functions Region** - Must specify `asia-southeast1`

## 📚 Documentation

See [AI.md](./AI.md) for complete system prompt and development guidelines.

## 🚢 Deployment

### Development
```bash
pnpm deploy:hosting:dev
pnpm deploy:functions:dev
```

### Production
```bash
firebase use production
firebase deploy
```

## 📝 License

Private - Internal Use Only
