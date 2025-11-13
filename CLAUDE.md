# Human Resources Admin System — CLAUDE Operational Playbook  
Version: 4.1.0 | Last Updated: 2025-11-13  

> Scope: This document defines **how Claude works** in the Human HR Monorepo — execution rules, workflows, and safe automation behavior.  
> ⚠️ Coding standards, conventions, and architectural patterns live in the **Master Guide**:  
> `@/standards/06-ai-coding-instructions.md` → Single Source of Truth (SSOT).  
> Do **not** restate or redefine project-wide rules here.

---

## 🎯 Role & Boundaries
- You are an **Elite Full Stack Developer** operating via **Claude CLI** for the **Human Admin System**.  
- Your objective: make **small, atomic, and type-safe** code changes.  
- Always run proper checks, ensure the app builds, and strictly follow the Master Guide.  
- **Never modify global standards** or coding conventions inside this file.

---

## 🔴 Critical Configuration (Never Violate)
```ts
// Firebase Project
projectId = "human-b4c2c";          // Fixed project ID
region    = "asia-southeast1";      // Required for Firebase Functions v2

// Package Manager
// pnpm 10.x ONLY — ❌ Never use npm or yarn
```

### Runtime Mode
- Functions runtime mode (ESM vs CJS) is defined in  
  `@/standards/08-firebase-functions-esm-v2-guide.md`.
- If any mismatch between repo config and docs — follow repo runtime and file a `docs-sync` PR.

---

## 🗂 Monorepo Map
```
human-monorepo/
│   │   └── src/
│   │       ├── app/              # App root (routing, providers)
│   │       ├── domains/          # Business logic (Core HR modules)
│   │       │   ├── people/           # Employee profiles & records
│   │       │   ├── positions/        # Job titles, organization chart
│   │       │   ├── teams/            # Department & reporting structure
│   │       │   ├── candidates/       # ATS (Applicant Tracking System)
│   │       │   ├── onboarding/       # New hire onboarding
│   │       │   ├── offboarding/      # Exit process
│   │       │   ├── performance/      # OKRs / KPI review
│   │       │   └── system/           # Auth, RBAC, settings
│   │       ├── pages/            # Route-level views
│   │       │   ├── DashboardPage.tsx
│   │       │   ├── EmployeesPage.tsx
│   │       │   ├── CandidatesPage.tsx
│   │       │   └── PerformancePage.tsx
│   │       └── shared/           # Common components & helpers
│   │           ├── components/
│   │           ├── layout/
│   │           ├── lib/
│   │           ├── schema/
│   │           ├── stores/
│   │           ├── styles/
│   │           └── utils/
│   └── mobile/              # (Optional) Mobile HR App
├── packages/
│   ├── types/               # Shared TS types (Employee, Role, etc.)
│   ├── ui-core/             # Shared UI components
│   ├── utils/               # Shared logic
│   └── design-tokens/       # Theme & design constants
└── functions/               # Firebase Functions v2 (Admin APIs)
```

🧭 **Placement Rules**
- All HR business logic → `apps/admin-panel/src/domains`
- Shared libraries → `packages/`
- No cross-domain imports — use alias paths (`@/...`)

---

## 🧭 Command Palette (Standard Workflow)

### Build & Verify Loop
```bash
pnpm format       # Format imports and code
pnpm lint         # Biome linting
pnpm type-check   # TypeScript strict mode
pnpm build        # Vite build
pnpm preview      # Preview production build
```

### Firebase Emulators & Seed Data
```bash
firebase emulators:start
pnpm seed:run    # Run HR seed scripts (see @/standards/09)
```

### Optional Utilities
```bash
pnpm biome check .
pnpm -w run test
```

---

## 🧾 Response Format (Claude CLI)

When updating files, output must be **minimal**, **compilable**, and **structured**:

**1️⃣ File Patch**
```md
**apps/admin-panel/src/domains/people/features/employee-list/EmployeeTable.tsx**
```tsx
import type { FC } from 'react';
import { useEmployeeList } from '@/domains/people/hooks/useEmployeeList';

export const EmployeeTable: FC = () => {
  const { data } = useEmployeeList();
  return <div>{data?.length ?? 0} employees</div>;
};
```
```

**2️⃣ Commands**
```bash
pnpm format && pnpm lint && pnpm type-check && pnpm build
```

**3️⃣ Commit**
```text
feat(people): add EmployeeTable component using useEmployeeList hook
```

🧩 Keep output clean, compilable, and aligned with FSD.

---

## 🚧 Guardrails

✅ **DO**
- Use aliases (`@/...`, `@human/*`) only.  
- Place new files in correct FSD layer (`domains/<domain>/features/<feature>`).  
- Use **zod** for validation schemas.  
- Use **React Query (TanStack)** for async state.  
- Use **RBAC** utilities from `system/` for access control.  

❌ **DON’T**
- Don’t change `projectId`, region, or package manager.  
- Don’t use `any` or `@ts-ignore`.  
- Don’t access environment vars via `process.env` in apps — use `import.meta.env.VITE_*`.  
- Don’t import across domains directly.  
- Don’t add new dependencies without approval.

---

## 🔑 Environment Rules
| Context | Use | Example |
|----------|-----|----------|
| Apps | `import.meta.env.VITE_*` | `import.meta.env.VITE_FIREBASE_KEY` |
| Functions | `process.env.*` | `process.env.SLACK_TOKEN` |

If undefined → add to `.env` or Firebase config.  
Never document env vars here — document in Master Guide only.

---

## 🧱 ESM / CJS Rules
- **Apps:** ESM only (`import` syntax).  
- **Functions:** Match repo runtime config (`"type": "module"` or CommonJS).  
  - Mismatch → follow current repo, open a `docs-sync` PR.

---

## 🧪 Code Templates

### Component
```tsx
import type { FC } from 'react';

interface Props {
  title: string;
}

export const HeaderTitle: FC<Props> = ({ title }) => (
  <h1 className="text-2xl font-semibold">{title}</h1>
);
```

### Service (Firestore)
```ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type { Employee } from '@human/types';

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    const snap = await getDocs(collection(db, 'employees'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Employee, 'id'>) }));
  },
};
```

### Schema
```ts
import { z } from 'zod';

export const EmployeeFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  positionId: z.string(),
});

export type EmployeeFormInput = z.infer<typeof EmployeeFormSchema>;
```

---

## 🧰 Troubleshooting

| Issue | Resolution |
|-------|-------------|
| Module not found | Verify tsconfig paths and imports |
| Env var undefined | Use `import.meta.env.VITE_*` |
| Firestore Timestamp | Convert with `toDate()` |
| Missing deps in useEffect | Add or memoize dependencies |

---

## ✅ Execution Checklist
- [ ] Correct FSD path placement  
- [ ] Aliases used properly  
- [ ] Type-safe and compilable  
- [ ] One logical commit message  
- [ ] Run → `pnpm format && pnpm lint && pnpm type-check && pnpm build`  
- [ ] For cross-doc writes → use Functions v2  
- [ ] For seed → use `packages/scripts/src/seed/`

---

## 🔗 Reference Links
| Guide | Path |
|--------|------|
| Master Coding Rules (SSOT) | `@/standards/06-ai-coding-instructions.md` |
| Firestore Modeling | `@/standards/07-firestore-data-modeling-ai.md` |
| Firebase Functions v2 | `@/standards/08-firebase-functions-esm-v2-guide.md` |
| Seed & Emulators | `@/standards/09-seed-scripts-and-emulator-guide.md` |

---

## 🧯 When in Doubt
1. Always defer to the **Master Guide**.  
2. Keep changes minimal, reversible, and type-safe.  
3. Use `// TODO: docs-sync` if inconsistency found.  
4. Never define new standards here — this file is for **operation**, not **policy**.
