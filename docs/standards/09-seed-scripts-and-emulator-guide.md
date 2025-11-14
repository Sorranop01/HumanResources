title: Seed Scripts and Emulator Guide (Human HR)
description: How AI and developers should write, validate, and execute seed scripts safely in the Human HR Monorepo with Firestore Emulator and Production compatibility.
refs:

- ./07-firestore-data-modeling-ai.md
- ./10-Single-Source-of-Truth-Zod.md

---

# 09 — Seed Scripts & Emulator Guide (Human HR Monorepo)

**Purpose:**  
This guide defines how AI and developers should write, validate, and execute seed scripts safely within the **Human HR Monorepo**, ensuring data integrity and full compatibility with Firestore Emulators and Production environments.

---

## 🧭 Overview

Seed scripts are responsible for populating **initial test data** into Firestore or the Emulator during development.  
They must always follow the same data structures defined in the official **Schema Definitions** under `@/shared/schemas`.

> ⚠️ Seed data is **not just mock data** — it’s a reproducible dataset that must always stay in sync with the latest schema versions.

---

## 🏗️ Directory Structure

```txt
/packages
  /scripts
    ├── seed/
    │   ├── seed-users.ts
    │   ├── seed-positions.ts
    │   ├── seed-teams.ts
    │   └── index.ts                # entry point
    ├── utils/
    │   └── stripUndefined.ts
    └── data/
        └── fixtures/               # static JSONs (optional)
All seed scripts live under /packages/scripts/seed/.

Each file seeds a single collection or domain (atomic structure).

All scripts must import type definitions and schemas from @/shared/schemas.

🧩 Section 1 — Using Schemas as the Source of Truth
To ensure consistent data between Firestore, TypeScript types, and runtime validation:

Use the schema from @/shared/schemas when defining the seed payload.

ts
// Import both the Zod Schema AND the inferred type from the *same* schema file
import {
  EmployeeSchema,
  type Employee,
} from '@/shared/schemas/employee.schema';

const employee: Employee = EmployeeSchema.parse({
  id: 'emp_001',
  name: 'Alice Johnson',
  email: 'alice@human.co',
  positionId: 'pos_001',
  startDate: new Date().toISOString(),
});
Validate before sending to Firestore

ts
คัดลอกโค้ด
EmployeeSchema.parse(employee);

await addDoc(collection(db, 'employees'), employee);
Never define structure inline inside the seed script — always import the correct schema and types.

⚙️ Section 2 — Firestore Write Safety Rules
Firestore does not allow undefined values.
Seed scripts must guarantee that every payload passes these constraints.

✅ Firestore Safe Rules
Rule	Description
1️⃣	Never send undefined values into Firestore.
2️⃣	Use null for intentionally empty fields.
3️⃣	If the field is optional, omit it or set a default value.
4️⃣	All timestamps must use serverTimestamp() when applicable.
5️⃣	Always strip undefined values before writing.

Example:

ts
คัดลอกโค้ด
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { stripUndefined } from '../utils/stripUndefined';
import { EmployeeSchema } from '@/shared/schemas/employee.schema';

const employee = stripUndefined({
  tenantId: 'default',
  name: 'Alice Johnson',
  email: 'alice@human.co',
  positionId: 'pos_001',
  startDate: serverTimestamp(),
  phone: undefined,
});

EmployeeSchema.parse(employee);
await addDoc(collection(db, 'employees'), employee);
🧰 Section 3 — Utility: stripUndefined()
ts
คัดลอกโค้ด
export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as T;
}
🔸 Optional fields = Omit them or set to null
🔸 Required fields = Always provide explicit values

🧪 Section 4 — Running the Seed Scripts (Local & Emulator)
1️⃣ Start the Firestore Emulator
bash
คัดลอกโค้ด
pnpm dev:emulators
# or
firebase emulators:start
2️⃣ Run the seed script
bash
คัดลอกโค้ด
pnpm seed
# equivalent to:
pnpm tsx packages/scripts/seed/index.ts
3️⃣ Verify Data
Visit:

txt
คัดลอกโค้ด
http://localhost:4000
→ Emulator UI → Firestore → Check the seeded collections.

🚀 Section 5 — Best Practices
❇️ Use Type Safety
// Import the inferred type from its schema definition (Zod SSOT)
import type { Position } from '@/shared/schemas/position.schema';
// (This assumes position.schema.ts exports: `export type Position = z.infer<typeof PositionSchema>`)

const position: Position = {
  id: 'pos_001',
  name: 'HR Manager',
  department: 'People',
  level: 'Mid',
  tenantId: 'default',
};
❇️ Use Promise.all for bulk inserts
Avoid sequential await inside loops.

ts
คัดลอกโค้ด
await Promise.all(
  positions.map(async (position) => {
    const payload = PositionSchema.parse(position);
    return addDoc(collection(db, 'positions'), stripUndefined(payload));
  }),
);
❇️ Use Environment Guard
ts
คัดลอกโค้ด
if (process.env.NODE_ENV !== 'development') {
  throw new Error('Seed scripts can only run in development mode.');
}
❇️ Production seeds must NOT run manually
Use Cloud Functions or Admin SDK (controlled scripts only).

🧩 Section 6 — Data Source Synchronization
Step	Description
1️⃣	Define the Zod Schema in @/shared/schemas.
2️⃣	Export the TS type using z.infer.
3️⃣	Seed scripts must import schema + type + parse payload.
4️⃣	If schema changes → update schemas + seeds together.
5️⃣	Never hardcode new fields inside seed files.

Example:

ts
คัดลอกโค้ด
import { DepartmentSchema } from '@/shared/schemas/department.schema';

const payload = DepartmentSchema.parse({
  id: 'dep_001',
  name: 'Human Resources',
  code: 'HR',
  tenantId: 'default',
});

await addDoc(collection(db, 'departments'), payload);
🧾 Section 7 — Example: Full Seed Flow
ts
คัดลอกโค้ด
// packages/scripts/seed/index.ts
import { seedDepartments } from './seed-departments';
import { seedPositions } from './seed-positions';
import { seedEmployees } from './seed-employees';
import { initializeEmulators } from '../utils/initEmulator';

async function main() {
  await initializeEmulators();

  await seedDepartments();
  await seedPositions();
  await seedEmployees();

  console.log('✅ Seed completed successfully');
}

main().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
🧩 Section 8 — Emulator Initialization
ts
คัดลอกโค้ด
// packages/scripts/utils/initEmulator.ts
import { connectFirestoreEmulator } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

export async function initializeEmulators() {
  if (process.env.NODE_ENV === 'development') {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
}
🔐 Section 9 — Security & Cleanup
Seed scripts must never write to production Firestore.

Always verify the connection target before seeding.

Clear emulator data:

bash
คัดลอกโค้ด
firebase emulators:exec "echo clearing" --only firestore --import ./data
Reset seed data:

bash
คัดลอกโค้ด
pnpm seed:reset
🛠️ Section 10 — Troubleshooting
⚠️ T1 — Firestore rejects undefined values
Fix:

Sanitize (stripUndefined)

Validate with Zod (Schema.parse())

Or enable ignoreUndefinedProperties (Admin SDK only)

⚠️ T2 — “require is not defined in ES module scope”
ESM projects must NOT use:

ts
คัดลอกโค้ด
require.main === module;
Fix: Use central index.ts instead.

⚠️ T3 — Batch writes fail when fields contain undefined
Always sanitize:

ts
คัดลอกโค้ด
const safe = stripUndefined(raw);
batch.set(ref, safe);
⚠️ T4 — Quick Author Checklist
Schema imported?

Parsed before write?

No undefined?

Optional fields handled?

tenantId present?

No require.main?

Deterministic & idempotent?

⚠️ T5 — tenantId Consistency (Critical)
Problems that break queries:

❌ Using tenantId: "tenant-default" in seeds

❌ Missing tenantId entirely

❌ Wrong collection names (e.g., payroll instead of payrollRecords)

Solutions:

Always use:

ts
คัดลอกโค้ด
tenantId: 'default'
Match service-layer collection names:

'payrollRecords' (not 'payroll')

departments must include tenantId

leaveTypes must include tenantId

Example:

ts
คัดลอกโค้ด
// ❌ WRONG
{ code: 'HR', name: 'Human Resources' }

// ✅ CORRECT
{ code: 'HR', name: 'Human Resources', tenantId: 'default' }

⚠️ T6 — Timestamp Validation with Admin SDK (Critical)

**Problem:** Zod schemas using `z.instanceof(Timestamp)` from Client SDK will FAIL in seed scripts!

**Root Cause:**
- Firebase Client SDK: `{ seconds, nanoseconds }`
- Firebase Admin SDK: `{ _seconds, _nanoseconds }` ← Different format!
- `z.instanceof()` requires exact class match

**Symptoms:**
```

Error: Input not instance of Timestamp
ZodError: Expected Firebase Timestamp

````

**Solution:** Use custom Timestamp validator

```typescript
// ✅ CORRECT - Works with both Client and Admin SDK
const FirestoreTimestampSchema = z.custom<unknown>(
  (val) => {
    if (val && typeof val === 'object') {
      return (
        ('_seconds' in val && '_nanoseconds' in val) || // Admin SDK
        ('seconds' in val && 'nanoseconds' in val) || // Client SDK
        (typeof val.toDate === 'function') // Has toDate method
      );
    }
    return false;
  },
  { message: 'Expected Firebase Timestamp' }
);

// Use in schema
export const MyEntitySchema = z.object({
  createdAt: FirestoreTimestampSchema, // ✅ Works!
  updatedAt: FirestoreTimestampSchema,
});
````

**Best Practice:**

- Always use `FirestoreTimestampSchema` for schemas shared between frontend and seed scripts
- Never use `z.instanceof(Timestamp)` from `firebase/firestore` in shared schemas
- Document this in schema file comments
  ✅ Summary
  Key Rule Description
  Schema First Always import Zod schemas — never redefine structure.
  Type Safety Parse all payloads with Zod.
  No Undefined Firestore rejects undefined fields.
  Atomic Seeds One script = one collection.
  Emulator Safe Never seed production manually.
  tenantId Consistency Always use tenantId: 'default'.
  Correct Collection Names Match names with the service layer.

🧠 AI Reminder
When generating or modifying seed scripts:

Import schema & types from @/shared/schemas

Parse payload using Zod

Strip undefined or replace with null

Always add tenantId: 'default'

Match collection names with service layer

Ensure emulator is running

Keep seeds deterministic & idempotent

```

```
