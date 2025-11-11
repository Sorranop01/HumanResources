# โครงสร้างโปรเจค HumanResources

โปรเจคนี้ใช้สถาปัตยกรรม **Feature-Slice Design (FSD)** ภายใน Vite + TypeScript monorepo

## 📁 โครงสร้างหลัก

```
HumanResources/
├── src/
│   ├── app/              # Root app configuration
│   │   ├── providers/    # React providers (Query, Router, Theme)
│   │   ├── router/       # App routing configuration
│   │   └── styles/       # Global styles
│   │
│   ├── shared/           # Shared reusable modules
│   │   ├── ui/           # Shared UI components (Button, Card, etc.)
│   │   ├── lib/          # Utilities and helpers (firebase, format, etc.)
│   │   ├── types/        # Global/Common types only
│   │   ├── constants/    # Constant values (routes, roles, etc.)
│   │   ├── config/       # Global configs (pagination, date formats, etc.)
│   │   ├── hooks/        # Shared custom hooks
│   │   └── stores/       # Global state stores (Zustand)
│   │
│   ├── domains/          # Business domains (separated by context)
│   │   ├── people/       # People management domain
│   │   │   ├── features/
│   │   │   │   └── employees/
│   │   │   │       ├── components/  # Employee UI components
│   │   │   │       ├── hooks/       # Employee hooks (useCreateEmployee, etc.)
│   │   │   │       ├── pages/       # Employee pages
│   │   │   │       ├── schemas/     # Zod validation schemas + types
│   │   │   │       ├── services/    # API/Firebase services
│   │   │   │       ├── types/       # Employee-specific types (if needed)
│   │   │   │       └── index.ts     # Public API exports
│   │   │   └── index.ts             # Domain-level exports
│   │   │
│   │   └── system/       # System/Infrastructure domain
│   │       ├── features/
│   │       │   ├── auth/             # Authentication feature
│   │       │   │   ├── components/  # Login, Register forms
│   │       │   │   ├── hooks/       # useLogin, useRegister, etc.
│   │       │   │   ├── pages/       # Auth pages
│   │       │   │   ├── schemas/     # Auth validation schemas
│   │       │   │   ├── services/    # authService, userService
│   │       │   │   ├── types/       # Auth-specific types
│   │       │   │   └── index.ts
│   │       │   │
│   │       │   └── rbac/            # Role-Based Access Control
│   │       │       ├── components/  # PermissionGuard, RoleTag
│   │       │       ├── hooks/       # usePermissions, useRoles
│   │       │       ├── schemas/     # RBAC validation
│   │       │       ├── services/    # Role & permission services
│   │       │       ├── types/       # RBAC types
│   │       │       ├── utils/       # Permission checking utilities
│   │       │       └── index.ts
│   │       │
│   │       └── index.ts
│   │
│   └── main.tsx          # App entry point
│
├── functions/            # Firebase Cloud Functions
│   └── src/
│       ├── api/          # API endpoints
│       ├── config/       # Functions config
│       └── middleware/   # Middleware functions
│
├── docs/                 # Documentation
│   └── standards/        # Coding standards and guidelines
│
├── public/              # Static assets
├── .env.development     # Development environment variables
├── .env.example         # Environment variables template
├── package.json         # Project dependencies
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── biome.json           # Biome linter/formatter config
```

## 🎯 หลักการสำคัญของ FSD

### 1. Import Rules

✅ **ใช้ alias imports เสมอ:**
```typescript
import { formatMoney } from '@/shared/lib/format';
import { EmployeeCard } from '@/domains/people/features/employees';
```

❌ **ห้ามใช้ relative imports แบบนี้:**
```typescript
import { formatMoney } from '../../../shared/lib/format';
```

### 2. Communication Rules

```
✅ Feature → Shared: อนุญาต
❌ Shared → Feature: ไม่อนุญาต
❌ Feature A → Feature B: ไม่อนุญาต (ใช้ shared แทน)
```

### 3. Type Organization

- **shared/types/** - เก็บเฉพาะ types ที่เป็น generic/common
  - `BaseEntity`, `ApiResponse`, `PaginatedResponse`

- **Feature-specific types** - ควรอยู่ใน feature/schemas/ หรือ feature/types/
  - `Employee`, `EmployeeStatus`, `CreateEmployeeInput`
  - Export ผ่าน feature's index.ts

### 4. Schema & Validation

- ใช้ **Zod** สำหรับ validation
- แยก schema types:
  - `EmployeeSchema` - สำหรับ database documents
  - `CreateEmployeeSchema` - สำหรับ API input
  - `EmployeeFormSchema` - สำหรับ form validation
  - `EmployeeFiltersSchema` - สำหรับ query filters

### 5. Services Layer

- แต่ละ feature มี service file ของตัวเอง
- Service handles API/Firebase operations
- Export query keys สำหรับ React Query

```typescript
// employeeService.ts
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
};

export const employeeService = {
  async getAll(): Promise<Employee[]> { ... },
  async getById(id: string): Promise<Employee> { ... },
  async create(data: CreateEmployeeInput): Promise<void> { ... },
};
```

## 📦 การใช้งาน

### Import จาก Domain
```typescript
// Import จาก domain-level
import {
  EmployeeCard,
  useEmployees,
  EmployeeListPage
} from '@/domains/people';

// Import จาก feature-level
import {
  LoginForm,
  useLogin,
  authService
} from '@/domains/system/features/auth';
```

### Import จาก Shared
```typescript
// Shared components
import { LoadingSpinner } from '@/shared/ui/components';
import { AdminLayout } from '@/shared/ui/layouts';

// Shared utilities
import { formatMoney, formatDate } from '@/shared/lib/format';

// Shared constants
import { ROUTES } from '@/shared/constants/routes';
import { ROLES } from '@/shared/constants/roles';

// Shared config
import { PAGINATION, DATE_FORMATS } from '@/shared/config';

// Shared types
import type { BaseEntity, ApiResponse } from '@/shared/types';
```

## 🚀 Best Practices

1. **แต่ละ feature เป็นอิสระ** - สามารถนำออกหรือแก้ไขได้โดยไม่กระทบ features อื่น
2. **ไม่มี circular imports** - ป้องกันการ import วนกลับ
3. **Type-safe ทุกที่** - ใช้ TypeScript strict mode
4. **Export ผ่าน index.ts** - ทุก feature ต้องมี index.ts สำหรับ public API
5. **Naming conventions:**
   - Components: `PascalCase` (e.g., `EmployeeCard`)
   - Hooks: `useCamelCase` (e.g., `useEmployees`)
   - Services: `camelCase` (e.g., `employeeService`)
   - Types: `PascalCase` (e.g., `Employee`)

## 📝 เพิ่ม Feature ใหม่

```bash
# 1. สร้างโครงสร้าง feature
mkdir -p src/domains/<domain>/features/<feature>/{components,hooks,pages,schemas,services,types}

# 2. สร้าง index.ts
touch src/domains/<domain>/features/<feature>/index.ts

# 3. Export feature ใน domain index.ts
# แก้ไข src/domains/<domain>/index.ts
```

## 🔍 การตรวจสอบโครงสร้าง

```bash
# TypeScript type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test
```

## ⚠️ ปัญหาที่พบบ่อย

1. **Import alias ไม่ทำงาน** - ตรวจสอบ `tsconfig.json` และ `vite.config.ts`
2. **Circular dependency** - ตรวจสอบว่า feature ไม่ได้ import feature อื่นโดยตรง
3. **Type conflicts** - ตรวจสอบว่าไม่มี type ซ้ำกันระหว่าง shared และ feature

## 📚 อ้างอิง

- [Feature-Slice Design Official](https://feature-sliced.design/)
- [Project Standards](/docs/standards/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
