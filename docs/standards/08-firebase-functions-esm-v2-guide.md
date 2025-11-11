Purpose: Hard rules and templates for AI when writing & fixing Cloud Functions (Admin SDK v12+, Functions v2). Targets typical errors: import order, missing types, any, v1→v2 migration, and formatter issues.

🇬🇧 Section A — Hard Rules for AI
A.1 Runtime & Project Setup

Use ESM everywhere in functions/.

package.json (in functions/):

{
  "type": "module",
  "engines": { "node": ">=18" },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "deploy": "firebase deploy --only functions"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^20.0.0"
  }
}


tsconfig.json (in functions/):

{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "lib",
    "rootDir": "src",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}

A.2 Import/Export Rules (Biome)

Order: 3rd-party → internal shared → local; then alphabetical within group.

Type-only imports must use import type.

Use Functions v2 imports only:

import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { getFirestore, FieldValue, Timestamp, type Query } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';


Do not mix v1 (functions.https.onCall) with v2.

A.3 Handler Shapes (v2)

Callable

type Payload = { email?: string; password?: string; displayName?: string; /* ... */ };

export const createEmployee = onCall(async (request: CallableRequest<Payload>) => {
  const { auth, data } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'Must be authenticated.');
  // ...
  return { ok: true };
});


HTTP (if needed)

import { onRequest } from 'firebase-functions/v2/https';
export const ping = onRequest((req, res) => res.status(200).send('ok'));

A.4 No any — Error Handling Pattern
try {
  // ...
} catch (error: unknown) {
  logger.error('Operation failed', { error });
  const code =
    typeof error === 'object' && error && 'code' in error ? (error as { code?: string }).code : undefined;

  if (code === 'auth/email-already-exists') {
    throw new HttpsError('already-exists', 'The email address is already in use.');
  }
  throw new HttpsError('internal', 'Unexpected error.');
}

A.5 Firestore Typing (Admin SDK)

Import TS types rather than using FirebaseFirestore.* namespace:

import { type Query, type DocumentData } from 'firebase-admin/firestore';

const db = getFirestore();
let q: Query<DocumentData> = db.collection('roles');
q = q.where('isActive', '==', true);
const snap = await q.get();
const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));


Avoid as any. Use concrete generics or DocumentData.

A.6 Formatter Hints

Respect Biome’s multiline throws & JSX wrapping:

throw new HttpsError(
  'permission-denied',
  'You do not have permission to perform this action.'
);


Keep ternaries wrapped with parentheses when Biome suggests.

A.7 Barrels

For index.ts in API folders:

Keep grouped comments (// Employees, // Roles, etc.)

Alphabetize within group; no dangling blank exports.

🇬🇧 Section B — Fix Recipes for Common Diagnostics
B.1 assist/source/organizeImports

Reorder imports to: admin/auth, admin/firestore, functions/logger, functions/v2/https, then internal.

Example (fixed):

import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { ROLES } from '../../shared/constants/roles.js';

B.2 lint/suspicious/noExplicitAny

Replace catch (error: any) → catch (error: unknown) and narrow (see A.4).

Replace as any on queries with Query<DocumentData> (see A.5).

B.3 Formatter would have printed…

Split long throw new HttpsError(...) into multiple lines.

Collapse trivial destructuring/ternaries per formatter suggestion.

B.4 v1 → v2 Migration (Callable)

Before (v1):

export const fn = functions.region('asia-southeast1').https.onCall(async (data, context) => { ... });


After (v2):

import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
export const fn = onCall(async (request: CallableRequest<MyPayload>) => {
  const { data, auth } = request;
  if (!auth) throw new HttpsError('unauthenticated', '...');
  // ...
});

🇬🇧 Section C — Ready-to-Use Templates
C.1 createEmployee (pattern)
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp, type Query, type DocumentData } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';
import { ROLES } from '../../shared/constants/roles.js';

type CreateEmployeePayload = {
  email: string;
  password: string;
  displayName: string;
  employeeData: Record<string, unknown>;
};

export const createEmployee = onCall(async (request: CallableRequest<CreateEmployeePayload>) => {
  const { auth, data } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'Must be authenticated.');

  const db = getFirestore();
  const adminAuth = getAuth();

  // RBAC check (example)
  const userRef = db.collection('users').doc(auth.uid);
  const userSnap = await userRef.get();
  const userRole = userSnap.data()?.role;
  if (![ROLES.ADMIN, ROLES.HR].includes(userRole)) {
    throw new HttpsError('permission-denied', 'You do not have permission to create an employee.');
  }

  const { email, password, displayName, employeeData } = data ?? {};
  if (!email || !password || !displayName || !employeeData) {
    throw new HttpsError('invalid-argument', 'Missing required fields: email, password, displayName, employeeData.');
  }

  try {
    const newUser = await adminAuth.createUser({ email, password, displayName, emailVerified: false });
    const now = Timestamp.now();
    await db.collection('employees').doc(newUser.uid).set({
      ...employeeData,
      uid: newUser.uid,
      email,
      displayName,
      createdAt: now,
      updatedAt: now
    });
    return { uid: newUser.uid };
  } catch (error: unknown) {
    logger.error('Error creating employee', { error });
    const code =
      typeof error === 'object' && error && 'code' in error ? (error as { code?: string }).code : undefined;
    if (code === 'auth/email-already-exists') {
      throw new HttpsError('already-exists', 'The email address is already in use by another account.');
    }
    throw new HttpsError('internal', 'Failed to create authentication user.');
  }
});

C.2 listRoles (typed query, no any)
import { getFirestore, type Query, type DocumentData } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';

type ListRolesPayload = {
  includeInactive?: boolean;
  systemOnly?: boolean;
  customOnly?: boolean;
};

export const listRoles = onCall(async (request: CallableRequest<ListRolesPayload>) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be authenticated.');

  const { includeInactive = false, systemOnly = false, customOnly = false } = request.data || {};
  const db = getFirestore();

  let query: Query<DocumentData> = db.collection('roles');

  if (!includeInactive) query = query.where('isActive', '==', true);
  if (systemOnly) query = query.where('isSystemRole', '==', true);
  if (customOnly) query = query.where('isSystemRole', '==', false);

  try {
    const snap = await query.get();
    const roles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { roles, count: roles.length };
  } catch (error: unknown) {
    logger.error('Failed to list roles', { error, userId: request.auth.uid });
    throw new HttpsError('internal', 'Failed to list roles');
  }
});

🇹🇭 Section D — สรุปแนวปฏิบัติ (สำหรับทีม)

ใช้ ESM + Functions v2 เท่านั้นใน functions/

จัด import ตาม Biome (3rd-party → internal → local) และใช้ import type กับ type

ห้ามใช้ any — ใช้ unknown แล้วทำ type narrowing

เวลา query Firestore ให้ใช้ type Query<DocumentData> แทนการ cast as any หรือ namespace

ปรับโค้ด throw new HttpsError(...) ให้ขึ้นบรรทัดตาม formatter

Barrel index.ts ให้เรียงและจัดกลุ่ม exports ชัดเจน

🇬🇧 Section E — AI Fix Checklist for Current Errors

 Reorder imports per Biome in:

functions/src/api/employees/createEmployee.ts

functions/src/api/roles/{createRole,deleteRole,listRoles,updateRole}.ts

functions/src/api/roles/index.ts

 Replace catch (error: any) with unknown + narrowing in:

createEmployee.ts, createRole.ts, deleteRole.ts, listRoles.ts, updateRole.ts

 Replace as any in queries (e.g., listRoles.ts) with Query<DocumentData>

 Reformat multiline HttpsError to match Biome’s “formatter would have printed…”

 Ensure all handlers use v2 (onCall, onRequest) and correct CallableRequest<T>

 Re-run:

pnpm biome check --write functions
pnpm -C functions run build

🇬🇧 Section F — Ready Prompt (drop-in for AI)
Read and follow /docs/standards/06-ai-coding-instructions.md and /docs/standards/08-firebase-functions-esm-v2-guide.md.

Fix Functions code with minimal diffs:
- Use ESM + Functions v2 imports only.
- Reorder imports per Biome; use `import type` for types.
- Remove all `any`: use `unknown` + safe narrowing.
- For Firestore queries, use `Query<DocumentData>` instead of `as any` or namespaces.
- Reformat multiline throws/ternaries exactly as Biome preview.
- Keep runtime behavior the same.

Files to touch (at least): 
- functions/src/api/employees/createEmployee.ts
- functions/src/api/roles/{createRole,deleteRole,listRoles,updateRole}.ts
- functions/src/api/roles/index.ts

After edits, ensure:
1) pnpm biome check --write functions
2) pnpm -C functions run build
3) firebase emulators:start or deploy

Return unified diffs + a per-file changelog.