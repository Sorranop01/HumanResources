Purpose: Rules and decision frameworks for an AI that designs Firestore data models, maps documents, chooses array vs subcollection, plans denormalization, and decides client vs Cloud Functions responsibly.

🇬🇧 Section A — AI Operating Rules
A.0 Golden Rules

Optimize for query patterns first, then structure data to fit those reads.

Prefer shallow documents with explicit indexes over complex, deeply nested structures.

Denormalize intentionally for read performance; keep small, safe duplication with automated consistency (triggers/batch).

Security & Rules are part of the model (not an afterthought).

Everything must be type-safe (TypeScript), schema-validated (e.g., Zod), and emulator-tested.

A.1 Document vs Subcollection vs Array — Decision Guide

Use a top-level collection when:

You need to query across many owners (e.g., employees, departments).

You need composite indexes or filters/sorts on multiple fields.

Use a subcollection when:

Strong parent-child ownership (employees/{id}/attendance).

You rarely need cross-parent queries; you’ll use collectionGroup when necessary.

Each child item is frequently created/updated independently.

Use an array field when:

You only need membership checks (array-contains) or small ordered lists (< ~100 elements typical).

You do not need partial item updates or per-item security.

Use a map field when:

Values are small, updated together, no need to query individual child items.

Avoid arrays for:

Large, frequently mutated collections of items.

Items requiring separate permissions, pagination, or per-item updates.

A.2 Denormalization (Duplication) Rules

Allowed for:

Display-ready fields (e.g., employeeName, departmentName) copied into child docs for faster list rendering.

Aggregates (e.g., commentCount, likeCount) maintained via Cloud Functions or atomic increments.

Constraints:

Never duplicate sensitive or fast-changing state unless you own a sync mechanism (Function triggers, transactions).

Cap duplication depth: 1 hop away from source (parent → child) unless justified.

Consistency mechanisms:

onWrite triggers to sync fields.

Transaction/batch on multi-doc updates.

Idempotent jobs (re-run safe) for backfills.

A.3 Client vs Cloud Functions — Decision Matrix
Action	Client	Cloud Function
Public read (authorized via rules)	✅	—
Simple write (user’s own doc, single doc)	✅	—
Privileged write (admin-only, cross-user)	❌	✅
Multi-doc transaction / cross-collection consistency	⚠️ Possible	✅ Preferred
Aggregations / counters updates	❌	✅
Scheduled jobs / TTL cleanup	❌	✅ (scheduled)
Secret usage (API keys, server-only logic)	❌	✅
Heavy compute / PII handling	❌	✅

Rule: if security, consistency, or secrecy is involved → Cloud Functions.

A.4 Security & Rules Embedding

Every collection design must include:

Owner field (e.g., ownerId, tenantId).

Created/Updated timestamps (createdAt, updatedAt with serverTimestamp()).

Rules draft: who can read/write which fields; allow-list fields for updates.

Use custom claims for RBAC; design queries compatible with rules.

A.5 Query & Index Strategy

Start from critical screens → list needed filters/sorts → define indexes up front.

Prefer single-field sort with minimal filters; precompute sortable fields if needed.

Use collectionGroup for cross-parent queries; ensure naming symmetry.

Always plan pagination (limit, startAfter with stable order fields).

A.6 IDs & Naming

Collection names: plural, snake or kebab (employees, attendance_records).

Doc IDs: auto-ID unless you need semantic IDs (unique keys).

Subcollections: keep consistent names for collectionGroup queries (e.g., attendance everywhere).

A.7 Time & Region

Store time as Firestore Timestamp in UTC.

If you need display-localization, keep user timezone separately (don’t store localized strings of time).

A.8 Transactions & Batches

Use transactions if you read-then-write the same doc(s) with contention risk.

Use batched writes for atomic multi-doc updates without read preconditions.

Keep batches under Firestore limits (~500 ops).

A.9 Counters & Aggregations

Maintain counters with atomic increments or Functions onWrite triggers.

For event-based aggregation (e.g., daily attendance hours), store immutable events and compute aggregates via background Functions.

A.10 Migrations

Use idempotent scripts (Admin SDK) stored in functions/src/scripts/ with a “migration registry” doc to avoid reruns.

Never block app boot on long migrations—run out-of-band.

A.11 Cost & Performance Hygiene

Minimize number of reads per screen → denormalize what you render.

Prefer server-side (Functions) for fan-out writes and aggregations.

Cache in client (React Query) and invalidate via keys aligned to collections/doc paths.

🇬🇧 Section B — Reference Templates
B.1 TypeScript Types (Shared)
// shared/types/firestore.ts
export type ID = string;

export type BaseDoc = {
  id?: ID;               // doc.id (not stored) — mirror when mapping
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
  tenantId: ID;
  ownerId?: ID;          // optional for user-owned docs
};

export type FirebaseTimestamp = import('firebase/firestore').Timestamp;

B.2 Example: Employees & Attendance

Collections:

employees (top-level)

employees/{id}/attendance (subcollection) — for daily events

Optional: attendance_daily (top-level) — denormalized read model for listing

Employee:

export type Employee = BaseDoc & {
  firstName: string;
  lastName: string;
  departmentId: ID;
  position?: string;
  isActive: boolean;
  displayName: string; // denormalized: `${firstName} ${lastName}`
};


Attendance Event (subcollection):

export type AttendanceEvent = BaseDoc & {
  date: string; // 'YYYY-MM-DD' for partitioning + equality filters
  clockInTime?: FirebaseTimestamp;
  clockOutTime?: FirebaseTimestamp;
  durationHours?: number; // computed, optional
  employeeId: ID;         // duplicate for collectionGroup queries
  employeeName: string;   // denormalized for lists
};


Denormalized Daily rollup (optional, top-level):

export type AttendanceDaily = BaseDoc & {
  employeeId: ID;
  date: string;           // 'YYYY-MM-DD'
  totalHours: number;     // maintained by Function
  lastEventAt: FirebaseTimestamp;
  employeeName: string;   // for list screens
};

B.3 Zod Schemas (Validation)
import { z } from 'zod';

export const EmployeeCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  departmentId: z.string().min(1),
  position: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const AttendanceEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clockInTime: z.any().optional(),
  clockOutTime: z.any().optional(),
});

B.4 Mapping Helpers (Web SDK)
import {
  Timestamp, serverTimestamp, doc, getDoc, setDoc,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

export const nowTS = () => serverTimestamp();

export const withBaseCreate = <T extends object>(tenantId: string, ownerId?: string) =>
  ({ ...data }: T) => ({
    ...data,
    tenantId,
    ownerId,
    createdAt: nowTS(),
    updatedAt: nowTS(),
  });

export const withBaseUpdate = <T extends object>() =>
  ({ ...patch }: T) => ({
    ...patch,
    updatedAt: nowTS(),
  });

// Example create
export async function createEmployee(id: string, input: Omit<Employee, keyof BaseDoc | 'id'>) {
  const ref = doc(db, 'employees', id);
  await setDoc(ref, withBaseCreate<Employee>(input.tenantId, input.ownerId)(input));
}

B.5 Cloud Functions — Aggregation Trigger (Admin SDK)
// functions/src/triggers/attendanceOnWrite.ts
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

export const attendanceOnWrite = onDocumentWritten(
  'employees/{employeeId}/attendance/{eventId}',
  async (event) => {
    const after = event.data?.after.data();
    if (!after) return;

    const { employeeId, date, durationHours = 0 } = after;
    const rollupRef = db.collection('attendance_daily').doc(`${employeeId}_${date}`);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(rollupRef);
      const base = { employeeId, date, tenantId: after.tenantId, lastEventAt: FieldValue.serverTimestamp() };

      if (!snap.exists) {
        tx.set(rollupRef, { ...base, totalHours: durationHours ?? 0, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
      } else {
        const prev = snap.data()!;
        tx.update(rollupRef, { totalHours: (prev.totalHours ?? 0) + (durationHours ?? 0), updatedAt: FieldValue.serverTimestamp() });
      }
    });
  },
);