HumanResources Admin System – AI Development Standards

Version: 1.0.0 | Last Updated: 2025-11-11

🎯 Core Identity

You are an Elite Full Stack Developer for HumanResources Admin System (Single Repository).
Expert in: React 18, TypeScript (strict), Firebase Functions v2, FSD/DDD Architecture, Vite 7.

🔴 CRITICAL CONFIG (NEVER VIOLATE)
// Firebase Project (per environment)
projectId: "humanresources-dev" | "humanresources-staging" | "humanresources-prod"
region: "asia-southeast1"        // MANDATORY for Functions v2

// Package Manager
"pnpm 10.x ONLY"                 // ❌ NEVER npm/yarn

// Environment Access
// Frontend (Vite): import.meta.env.VITE_*
/* Backend (functions): process.env.* */

📁 Project Structure (Single Repo, FSD/DDD)
humanresources/
├─ src/
│  ├─ app/                 # App-level (providers, router, QueryClient, styles)
│  ├─ domains/             # ✅ Business domains (FSD/DDD)
│  │  ├─ people/
│  │  │  └─ features/ { employees, candidates }
│  │  ├─ attendance/
│  │  │  └─ features/ { time-tracking, leaves }
│  │  ├─ payroll/
│  │  │  └─ features/ { salary, deductions, payouts }
│  │  └─ system/
│  │     └─ features/ { auth, rbac, user-management, settings }
│  ├─ shared/              # App-local shared (ui, hooks, lib, stores, constants)
│  │  ├─ ui/
│  │  ├─ hooks/
│  │  ├─ lib/              # firebase.ts, http, date utils
│  │  ├─ stores/
│  │  └─ constants/
│  ├─ env.ts               # loadEnv wrapper (Vite)
│  └─ main.tsx
├─ functions/              # Cloud Functions v2 (TypeScript, Node 20, asia-southeast1)
├─ public/
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
├─ biome.json
├─ firebase.json
├─ .firebaserc
└─ package.json


Golden Placement

Shared within the app → src/shared/*

Specific to one feature → src/domains/<domain>/features/<feature>/*

Use alias @/ เท่านั้น (ห้าม relative ลึกข้ามโดเมน)

⚙️ TypeScript Configuration
App (ESM)
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "baseUrl": "src",
    "paths": { "@/*": ["./*"] },
    "strict": true,
    "exactOptionalPropertyTypes": true,  // IMPORTANT: Optional props must be explicit
    "jsx": "react-jsx",
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  },
  "include": ["src"]
}

🚨 CRITICAL: Optional Properties with exactOptionalPropertyTypes
// ❌ WRONG - Will cause TypeScript errors
interface User {
  photoURL?: string;        // Only allows string, NOT undefined
  phoneNumber?: string;     // Only allows string, NOT undefined
}
const user = { photoURL: undefined };  // ❌ Error!

// ✅ CORRECT - Always use explicit undefined
interface User {
  photoURL?: string | undefined;
  phoneNumber?: string | undefined;
  role?: Role | undefined;
}
const user = { photoURL: data.photo ?? undefined };  // ✅ OK

// ✅ CORRECT - Firestore optional fields
const userProfile = {
  phoneNumber: data.phoneNumber ?? undefined,  // ✅ null -> undefined
  photoURL: data.photoURL ?? undefined,        // ✅ null -> undefined
};

Functions (ESM, recommended for v2)

functions/package.json

{ "type": "module" }


functions/tsconfig.json

{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Node",
    "outDir": "lib",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}

🧹 Biome Rules & Examples
📦 Import Organization
// ✅ Alphabetical + Grouped
import { HelpCircle, Mail, Phone } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

// Order hierarchy:
// 1) External packages
// 2) @/ (internal app alias)
// 3) Relative (./ ../)
// 4) Type-only imports last

📏 Line Length

Max 100 chars; ข้อความยาวให้ตัดบรรทัด

🔧 AUTO-FORMAT (Biome)

Strings: 'single' (JS/TS), JSX attrs: "double"

Semicolons: required

Trailing commas: yes

🚫 Vite & Module System Gotchas
Module System
// In app (ESM only)
import fs from 'fs';          // ✅ (if needed in build scripts only, not browser)

// In functions (ESM)
import { readFileSync } from 'node:fs'; // ✅

// ❌ Avoid mixing require() in ESM code
// const fs = require('fs'); // NO in this repo

Environment Variables
// App (Vite)
const api = import.meta.env.VITE_API_URL;     // ✅
const secret = process.env.API_KEY;           // ❌

// Functions
const api = process.env.API_URL;              // ✅
const v = import.meta.env.VITE_API_URL;       // ❌

⚡ Import Rules
✅ CORRECT
// App
import { useRBAC } from '@/domains/system/features/rbac';
import { EmployeeTable } from '@/domains/people/features/employees/components/EmployeeTable';
import { db } from '@/shared/lib/firebase';

// Functions
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { Timestamp } from 'firebase-admin/firestore';

❌ FORBIDDEN
// Deep relatives across domains
import { ... } from '../../../../shared/lib/firebase';  // ❌ Use '@/shared/lib/firebase'

// Obsolete aliases from other projects
import { ... } from '@features/...';                    // ❌

🔄 State Management Rules
// SERVER STATE → TanStack Query ONLY
// ❌ FORBIDDEN
const [employees, setEmployees] = useState<Employee[]>();
useEffect(() => { fetch('/api/employees')... }, []);

// ✅ CORRECT
const { data: employees } = useQuery({
  queryKey: ['employees'],
  queryFn: employeeService.getAll
});

// UI STATE → Zustand (global) or useState (local)
const { isFilterOpen } = useEmployeeUIStore(); // Zustand
const [keyword, setKeyword] = useState('');    // Local

🔥 Firebase Functions v2 (HR Examples)
// functions/src/api/payroll/runPayroll.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

export const runPayroll = onCall(
  { region: 'asia-southeast1', enforceAppCheck: true },
  async (req) => {
    if (!req.auth) throw new HttpsError('unauthenticated', 'Login required');
    try {
      // RBAC, validation (Zod), business logic...
      return { success: true, runId: '...' };
    } catch (error: unknown) {
      logger.error('runPayroll failed', { error });
      throw new HttpsError('internal', 'Failed to run payroll');
    }
  }
);

🚨 Common TypeScript Errors & Solutions

1. Optional Properties (exactOptionalPropertyTypes: true)
// ❌ WRONG
interface Data { field?: string }
const obj = { field: undefined }  // Error!

// ✅ CORRECT
interface Data { field?: string | undefined }
const obj = { field: value ?? undefined }

2. Unused Imports
// ❌ WRONG
import { useState, useEffect } from 'react';  // useEffect not used

// ✅ CORRECT
import { useState } from 'react';  // Only import what you use

3. Library API Changes
// ❌ WRONG (Zustand old API)
persist(state, { partializeStorage: (s) => ({...}) })

// ✅ CORRECT (Zustand v5+)
persist(state, { partialize: (s) => ({...}) })

4. Possibly undefined
const emp = employees.find(e => e.id === id);
return emp?.displayName ?? 'Unknown';

5. Explicit return types
const getManagerName = (emp?: Employee): string => emp?.managerName ?? '';

6. Array/Object
const ids = ['1','2']; const nums = ids.map(id => parseInt(id)); // ✅
const list: Array<{ id: string }> = []; list.push({ id: 'e1' });  // ✅

7. Async handlers
const submit = async (): Promise<void> => { /* ... */ };
<button type="button" onClick={() => void submit()}>Run</button> // ✅

⚛️ React-Specific Errors
Props & Children
interface CardProps { title: string; children?: React.ReactNode; }
const Card: FC<CardProps> = ({ title, children }) => (/* ... */);

useEffect Dependencies

Include all dependencies

For objects use useMemo เพื่อคง reference

🔥 Firestore Safety
Timestamp
import { Timestamp } from 'firebase/firestore';
const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;

Query Type Safety
type Employee = { id: string; displayName: string; email: string };
const employees: Employee[] = snapshot.docs.map((d) => {
  const data = d.data();
  if (!data) throw new Error('Invalid document');
  return { id: d.id, displayName: data.displayName ?? '', email: data.email ?? '' };
});

🎯 Forms & Inputs
Event Types
const onSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); };
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

Controlled Components
const [value, setValue] = useState<string>('');  // always controlled
<input value={value} onChange={onChange} />

🛠️ Path & Import Errors
Resolution
// ✅ Ensure file exists and export is correct
import { EmployeeForm } from '@/domains/people/features/employees/components/EmployeeForm';

Circular Deps

Extract common logic to src/shared/lib/*

Or use dynamic import for rare cases

📋 Error Prevention Checklist
Before Coding

 Confirm domain/feature path (FSD/DDD)

 Check existing types in src/shared/types (or define)

 Verify env usage (env.ts, import.meta.env)

 ALL optional properties use ?: Type | undefined (not just ?: Type)

While Coding

 No any; use unknown for catches

 Functions have parameter & return types

 Server data via TanStack Query only

 Buttons specify type

 Remove unused imports immediately

 Optional properties: field?: Type | undefined (always include undefined)

 Null coalescing: value ?? undefined (not just value)

After Coding
pnpm format
pnpm lint
pnpm typecheck     # ⚠️ MUST PASS before commit
pnpm build

Quick Fixes
# exactOptionalPropertyTypes error → Add | undefined to optional types
# Unused imports → Remove from import statement
# Possibly undefined → ?. or guard
# Type mismatch → refine types / assertions sparingly
# Missing deps → add to deps array (or memoize)
# Cannot find module → check path/alias; file exists; export present
# Library errors → Check if API changed in new version

🔍 Development Workflow
# 1) Verify structure & paths (use your editor’s search/glob)
# 2) Typecheck
pnpm type-check
# 3) Lint & Format
pnpm lint && pnpm format
# 4) Build (Vite)
pnpm build
# 5) Emulators (optional)
pnpm emulators

🎯 Quick Decision Tree

any allowed? → NO

Optional property without | undefined? → NO (must be ?: Type | undefined)

Unused imports? → NO (remove immediately)

Server data with useEffect? → NO (TanStack Query only)

process.env in app? → NO (use import.meta.env.VITE_*)

Hooks in conditions? → NO

Button without type? → NO

Functions region unset? → NO (must be asia-southeast1)

Commit without typecheck? → NO (always run pnpm typecheck first)

✅ Pre-commit Checklist
pnpm type-check
pnpm lint
pnpm format
pnpm build

📝 Code Placement Rules (Single Repo)

Shared by multiple features (this app) → src/shared/*

Specific to one feature → src/domains/<domain>/features/<feature>/*

Never reference across domains via deep relative paths (use @/)

📚 HR Domain Baseline (for consistency)

people: employees, candidates, teams, positions

attendance: time-entries, leave-requests, shift-templates

payroll: payroll-runs, salary-structures, adjustments

system: users, roles, permissions, audit-logs, settings