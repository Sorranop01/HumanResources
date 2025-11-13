The Refactor Plan (Amended)

Create Schemas in their Correct FSD Location
This is the critical rule for where to place your schemas:

Core Models (in shared): If a schema is used by 2 or more different domains (e.g., Employee is used by People, Payroll, and Attendance), it MUST go in src/shared/schemas/.

src/shared/schemas/employee.schema.ts

src/shared/schemas/user.schema.ts

Domain-Specific Models (in domains): If a schema is used by only one domain (e.g., Holiday is only used by Attendance), it MUST go in that domain's schema folder.

src/domains/attendance/schemas/holiday.schema.ts

src/domains/people/schemas/position.schema.ts

Here is the plan to resolve the data drift between your schemas, types, services, and functions.

This is a very common problem in scaling applications. The solution is not to start over, but to refactor by establishing a Single Source of Truth (SSOT).

🎯 The Strategy: Zod as the Single Source of Truth In our stack (TypeScript + Zod), we must stop defining duplicate types. Your Zod schema is the single source of truth.

The Plan:

Define a Zod Schema: This file defines the object's shape, data types, and validation rules.

Infer TypeScript Type: We generate our TypeScript type directly from that Zod schema.

Use This Schema Everywhere:

Frontend (UI): For form validation.

Services (Firestore): To parse and validate data coming from Firestore (this catches data drift from the database).

Backend (Functions): To validate incoming req.data payloads.

🚀 The 4-Step Refactor Plan Let's use the Employee domain as the primary example.

Create the Core Schema in shared Core models used across multiple domains (like Employee, User, Role) must be centralized in src/shared/schemas/.
TypeScript

// 📍 Location: src/shared/schemas/employee.schema.ts import { z } from 'zod';

// 1. This is your SSOT. export const employeeSchema = z.object({ // Use string for Firestore Auto IDs or ULIDs id: z.string().min(1, 'ID is required'), firstName: z.string().min(2, 'First name is too short'), lastName: z.string().min(2, 'Last name is too short'), email: z.string().email('Invalid email address'), role: z.enum(['admin', 'hr', 'manager', 'employee', 'auditor']), teamId: z.string().optional(), // Use z.coerce.date() if you are storing Timestamps createdAt: z.coerce.date(), });

// 2. This is the Type we will use everywhere. // We no longer write "interface Employee {}" manually. export type Employee = z.infer; 2. Update Services (Firestore) to Use the Schema Your employeeService (per FSD rules) must now import this schema to guarantee that data from Firestore matches your application's expected type.

TypeScript

// 📍 Location: src/domains/people/features/employees/services/employeeService.ts import { collection, getDocs, type DocumentData } from 'firebase/firestore'; import { db } from '@/shared/lib/firebase'; // 👈 Import both the schema and the inferred type! import { employeeSchema, type Employee } from '@/shared/schemas/employee.schema';

const col = collection(db, 'employees');

export const employeeService = { async getAll(): Promise<Employee[]> { const snap = await getDocs(col);

// Use Zod to parse the data, ensuring it matches our type.
const parseResults = snap.docs.map(doc => {
  const data = { id: doc.id, ...(doc.data() as DocumentData) };

  // Use .safeParse() to handle validation errors gracefully
  const validation = employeeSchema.safeParse(data); 
  
  if (!validation.success) {
    // This catches data in the DB that doesn't match our schema
    console.error(`Invalid employee data (ID: ${doc.id}):`, validation.error);
    return null; 
  }
  return validation.data;
});

// Filter out any invalid entries
return parseResults.filter(Boolean) as Employee[];
},

// async createEmployee(data: Omit<Employee, 'id' | 'createdAt'>) { // // ... schema.omit(...) can validate input data here before sending // } }; 3. Update Cloud Functions to Use the Same Schema This is critical. Your functions/ backend must use the exact same Zod schema to validate all incoming requests.

TypeScript

// 📍 Location: functions/src/api/system/createUser.ts import { onCall, HttpsError } from 'firebase-functions/v2/https'; import * as logger from 'firebase-functions/logger'; import { z } from 'zod';

// 👈 Import the schema from src // (You may need a relative path or configure TS path aliases in functions/tsconfig.json) import { employeeSchema } from '../../src/shared/schemas/employee.schema';

// Create a specific schema for this function's input // by "re-using" fields from the main schema. const createUserRequestSchema = employeeSchema.pick({ firstName: true, lastName: true, email: true, role: true, });

export const createUser = onCall( { region: 'asia-southeast1', enforceAppCheck: true }, // (Rule 6) async (req) => { if (!req.auth) throw new HttpsError('unauthenticated', 'Login required'); // ... (RBAC check for 'admin' or 'hr')

// 1. Validate the input payload with Zod!
const validation = createUserRequestSchema.safeParse(req.data);
if (!validation.success) {
  throw new HttpsError('invalid-argument', 'Invalid payload', validation.error.issues);
}

// 2. 'data' is now 100% type-safe and validated.
const { email, role, firstName, lastName } = validation.data;

try {
  // ... (Business Logic: Create Auth user, create Firestore doc)
  logger.info(`Admin creating new user: ${email} (${role})`);
  return { success: true, userId: '...' };

} catch (error: unknown) {
  logger.error('createUser failed', { error });
  throw new HttpsError('internal', 'Failed to create user');
}
} ); 4. Update UI Components (React) Your React components now receive data that is guaranteed to be correct, because the employeeService (which useQuery calls) has already validated it.

TypeScript

// 📍 Location: src/domains/people/features/employees/components/EmployeeTable.tsx import { memo } from 'react'; import { useQuery } from '@tanstack/react-query'; import { Table, Spin } from 'antd'; import { employeeService } from '../services/employeeService'; // 👈 This type is imported from the Zod schema import type { Employee } from '@/shared/schemas/employee.schema';

export const EmployeeTable = memo(() => { // The 'data' type is Employee[] | undefined // This data is guaranteed to match the Zod schema const { data, isLoading } = useQuery({ queryKey: ['employees'], queryFn: employeeService.getAll, // (Rule 2) });

if (isLoading) return ;

return <Table rowKey="id" dataSource={data} columns={[/* ... */]} />; }); Summary Zod is the center of your data model.

By implementing this, your types (TS), services (Firestore validation), and functions (Input validation) are all forced to be consistent from a single file.

You should start by refactoring your most critical model (like Employee or User) first, and then apply this pattern to the other domains.

🚀 Step 5: Align Firestore Security Rules

While the first 4 steps guarantee our application code (frontend/backend) is consistent, Step 5 ensures the database itself is aligned.

The validation logic in firestore.rules MUST mirror the business logic defined in our Zod schemas. If Zod and our Security Rules disagree, the application will fail with a PERMISSION_DENIED error, even if the Zod validation passed.

🎯 Golden Rule

If you change a validation rule in a Zod schema (e.g., making a field optional, adding a new 'role' enum), you MUST update the corresponding Firestore Security Rule.

📝 Example: Role Enum Alignment

✅ Correct Alignment

Zod Schema:

role: z.enum(['admin', 'hr', 'employee']).optional()
Firestore Security Rule:

allow write: if request.resource.data.role in ['admin', 'hr', 'employee']
  || !('role' in request.resource.data);
✅ Both allow the same 3 roles AND both allow the field to be missing

❌ Wrong - Missing Optional Check

Zod Schema:

role: z.enum(['admin', 'hr', 'employee']).optional()
Firestore Security Rule:

allow write: if request.resource.data.role != null;
❌ Problem: Firestore rejects when role is missing, even though Zod allows it!

🔍 Real Example: Position Schema

We've implemented full alignment for the positions collection:

Zod Schema Location: src/shared/schemas/position.schema.ts Firestore Rules Location: firestore.rules (lines 178-281)

Example 1: Enum Validation

Zod:

export const PositionLevelSchema = z.enum([
  'executive',
  'senior-management',
  'middle-management',
  'supervisor',
  'staff',
  'junior',
]);
Firestore Rule:

function isValidPositionLevel(level) {
  return level in ['executive', 'senior-management', 'middle-management', 'supervisor', 'staff', 'junior'];
}
✅ Both allow exactly the same 6 values

Example 2: Complex Validation (SalaryRange)

Zod:

export const SalaryRangeSchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().min(1),
  })
  .refine((data) => data.max >= data.min, {
    message: 'เงินเดือนขั้นสูงต้องมากกว่าหรือเท่ากับเงินเดือนขั้นต่ำ',
  });
Firestore Rule:

function isValidSalaryRange(range) {
  return range.keys().hasAll(['min', 'max', 'currency'])
    && range.min is number
    && range.max is number
    && range.min >= 0
    && range.max >= 0
    && range.max >= range.min  // Same refine logic!
    && range.currency is string
    && range.currency.size() > 0;
}
✅ Both enforce the same business rule: max >= min

Example 3: Optional Fields

Zod:

nameEN: z.string().optional(),
parentPositionId: z.string().optional(),
Firestore Rule:

&& (!data.keys().hasAny(['nameEN']) || data.nameEN is string)
&& (!data.keys().hasAny(['parentPositionId']) || data.parentPositionId is string)
✅ Both allow these fields to be missing OR validate them if present

🔐 Permission-Based Rules

Firestore Rules also enforce who can do what:

match /positions/{positionId} {
  // Read: All authenticated users
  allow read: if isAuthenticated();

  // Create: HR and Admin only + data validation
  allow create: if isHR()
    && isValidPositionData(request.resource.data)
    && request.resource.data.currentEmployees == 0
    && request.resource.data.vacancy == request.resource.data.headcount;

  // Update: HR and Admin only + business logic
  allow update: if isHR()
    && isValidPositionData(request.resource.data)
    && request.resource.data.vacancy == (request.resource.data.headcount - request.resource.data.currentEmployees);

  // Delete: Admin only
  allow delete: if isAdmin();
}
This ensures:

✅ Only HR/Admin can create positions
✅ currentEmployees always starts at 0
✅ vacancy is always calculated correctly
✅ Only Admin can delete
⚠️ Maintenance Checklist

When updating Position validation rules:

 Update Zod schema in src/shared/schemas/position.schema.ts
 Update Firestore Rules in firestore.rules
 Update helper functions (e.g., isValidPositionLevel)
 Test both layers:
 Client-side form validation
 Service layer validation with safeParse()
 Firestore Rules validation (via emulator or real database)
 Deploy rules: firebase deploy --only firestore:rules
📚 See Full Documentation

For complete field-by-field mapping and examples, see: docs/firestore-rules-schema-alignment.md

🎓 Summary

Step 5 completes the SSOT strategy by ensuring the database itself validates data using the same rules as our application code.

The 5-Layer Validation Stack:

Frontend (Client) → Zod schema validates forms
Service Layer → safeParse() validates Firestore reads
Cloud Functions → Zod schema validates API inputs
Firestore Rules → Database validates all writes
Type System → TypeScript ensures compile-time safety
All 5 layers derive from ONE source of truth: the Zod schemas in src/shared/schemas/

Step 6: Schema Evolution & Data Migration Strategy Steps 1-5 guarantee that new data is valid and that existing data drift is detected. This final step defines how we fix data drift when business rules change.

Changing a schema (like making an optional field required) without migrating old data will break the application. The safeParse() in our services (Step 2) will fail, and our updated Security Rules (Step 5) will block updates to old documents.

This plan prevents that.

⚠️ The Scenario: A Breaking Schema Change Imagine we must enforce a new business rule:

Old Rule: employeeSchema -> teamId: z.string().optional() (Allowed to be null)

New Rule: employeeSchema -> teamId: z.string().min(1) (MUST have a team)

If we deploy this change immediately, all employees without a teamId in the database will fail validation, making parts of the app unusable.

Migration Workflow (The 5-Step Rule) Follow these 5 steps before deploying the new code.

Create a Migration Script: Create a new, single-use script in scripts/migrations/.
File Name: YYYYMMDD-backfill-employee-teamId.mjs

Write the "Backfill" Logic: The script must:
Query all documents that do not meet the new schema (e.g., where('teamId', '==', null)).

Loop through them.

"Fix" the data by applying a safe default (e.g., set teamId to a new "Unassigned" team ID).

Update the documents in the database.

Run the Script (Staging): Run the migration script on your Staging environment. Verify that all old data is now compliant with the new schema.

Run the Script (Production): Once staging is confirmed, run the migration script on the Production database.

Deploy the New Code: Only after all production data is "fixed" is it safe to deploy the new application code, which includes:

The updated Zod schema (e.g., teamId is no longer .optional()).

The updated Firestore Security Rules (Step 5) that now enforce the new rule.

---

## 🔧 Step 7: Common Schemas and Shared Validation Logic

**Date Added:** 2025-11-13  
**Implemented In:** Phase 3 Zod Validation Refactor

### The Problem: Code Duplication

During Phases 1-3 of the Zod validation implementation, we discovered that `FirestoreTimestampSchema` was being copied and pasted into every schema file (15-20 lines per file). This violated the DRY (Don't Repeat Yourself) principle and the Single Source of Truth strategy.

**Issues:**
- 65+ lines of duplicate code across 11 schema files
- If we need to update the validation logic, we'd have to change it in 11 places
- Risk of inconsistency if one file is updated but others are not
- Harder to maintain and test

### The Solution: Centralized Common Schemas

All common validation schemas that are used across multiple domains should be centralized in:

```
src/shared/schemas/common.schema.ts
```

### What Goes in common.schema.ts?

**✅ Include in common.schema.ts:**
- `FirestoreTimestampSchema` - Used in every Firestore collection
- `TenantIdSchema` - Used in all multi-tenant collections
- `FirestoreMetadataSchema` - Common audit trail fields (createdAt, updatedAt, createdBy, etc.)
- Other primitive validation logic used across 3+ domains

**❌ Don't include in common.schema.ts:**
- Domain-specific enums (e.g., `EmployeeStatusSchema`)
- Business logic validation (e.g., salary range checks)
- Domain-specific composite schemas

### Implementation Example

**Before (Duplicated):**
```typescript
// ❌ Copied in every schema file (employees, candidates, departments, etc.)
const FirestoreTimestampSchema = z.custom<Timestamp>(
  (val) => {
    if (val && typeof val === 'object') {
      return (
        ('_seconds' in val && '_nanoseconds' in val) ||
        ('seconds' in val && 'nanoseconds' in val) ||
        (typeof val.toDate === 'function')
      );
    }
    return false;
  },
  { message: 'Expected Firebase Timestamp' }
);
```

**After (Centralized):**

**File: `src/shared/schemas/common.schema.ts`**
```typescript
import type { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

/**
 * Firestore Timestamp Schema
 * Validates Firebase Timestamp objects from both Admin SDK and Client SDK
 */
export const FirestoreTimestampSchema = z.custom<Timestamp>(
  (val) => {
    if (val && typeof val === 'object') {
      return (
        ('_seconds' in val && '_nanoseconds' in val) || // Admin SDK
        ('seconds' in val && 'nanoseconds' in val) || // Client SDK
        (typeof (val as { toDate?: unknown }).toDate === 'function')
      );
    }
    return false;
  },
  { message: 'Expected Firebase Timestamp' }
);

export const TenantIdSchema = z.string().min(1, 'Tenant ID is required');

export const FirestoreMetadataSchema = z.object({
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  tenantId: TenantIdSchema,
});
```

**File: `src/domains/people/features/employees/schemas/index.ts`**
```typescript
import { z } from 'zod';
import { FirestoreTimestampSchema } from '@/shared/schemas/common.schema';

export const EmployeeSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  // ... other fields
  createdAt: FirestoreTimestampSchema,  // ✅ Imported from central location
  updatedAt: FirestoreTimestampSchema,
});
```

### Using FirestoreMetadataSchema

For schemas that include standard audit fields, you can merge with `FirestoreMetadataSchema`:

```typescript
import { FirestoreMetadataSchema } from '@/shared/schemas/common.schema';

export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  // ... other fields
}).merge(FirestoreMetadataSchema);
// ✅ Automatically includes: createdAt, updatedAt, createdBy, updatedBy, tenantId
```

### Files Refactored

**Phase 1 & 2 & 3 Schemas (11 files total):**
- ✅ `employees/schemas/index.ts`
- ✅ `candidates/schemas/index.ts`
- ✅ `departments/schemas/departmentSchemas.ts`
- ✅ `positions/schemas/positionSchemas.ts`
- ✅ `leave/schemas/leaveTypeSchema.ts`
- ✅ `leave/schemas/leaveEntitlementSchema.ts`
- ✅ `policies/schemas/shiftSchema.ts`
- ✅ `policies/schemas/holidaySchema.ts`
- ✅ `policies/schemas/workSchedulePolicySchema.ts`
- ✅ `policies/schemas/overtimePolicySchema.ts`
- ✅ `policies/schemas/penaltyPolicySchema.ts`

**Result:**
- Removed 65 lines of duplicate code
- Single source of truth for Firestore Timestamp validation
- Easier to maintain and update in the future
- Consistent validation logic across all collections

### Benefits

1. **Single Source of Truth:** One definition for common validation logic
2. **DRY Principle:** No code duplication across schema files
3. **Easier Maintenance:** Update once, affects all schemas
4. **Better Testing:** Test common schemas once, trust everywhere
5. **Consistency:** Guaranteed identical validation logic across domains
6. **Cleaner Code:** Schema files are more concise and focused

### Maintenance Rules

**When adding new common schemas:**
1. Ask: "Is this used by 3+ domains?"
2. If yes → Add to `common.schema.ts`
3. If no → Keep in domain-specific schema

**When updating FirestoreTimestampSchema:**
1. Update only in `src/shared/schemas/common.schema.ts`
2. All importing schemas automatically get the update
3. No need to touch 11 different files

### Related Documentation

- Implementation: `docs/ZOD_VALIDATION_PHASE3_COMPLETE.md`
- Original Plan: `docs/ZOD_VALIDATION_SEED_SCRIPTS_PLAN.md`
- Standards: `docs/standards/02-typescript-standards.md`

---

**Summary:** Always centralize common validation logic in `src/shared/schemas/common.schema.ts` to maintain Single Source of Truth and avoid code duplication. This is a critical part of the Zod validation strategy.


---

## 🛠️ Step 8: Practical Implementation Guide

**Date Added:** 2025-11-13  
**Context:** Multi-layer validation strategy for production systems

### The Complete Validation Flow

When implementing Zod validation in a production HR system, you must validate at **all 5 layers**. Skipping any layer creates security vulnerabilities and data inconsistencies.

### Real-World Implementation: Employee Collection

Let's walk through a complete implementation for the `employees` collection, covering all 5 layers.

---

### Layer 1: Frontend Form Validation

**File:** `src/domains/people/features/employees/components/EmployeeForm.tsx`

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateEmployeeSchema } from '../schemas';

export function EmployeeForm() {
  const form = useForm({
    resolver: zodResolver(CreateEmployeeSchema), // ✅ Frontend validation
  });

  const onSubmit = async (data) => {
    // Data is already validated by Zod before reaching here
    await createEmployee(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

**Benefits:**
- Immediate user feedback
- Prevents invalid submissions
- Type-safe form data

---

### Layer 2: Service Layer Validation (Firestore Reads)

**File:** `src/domains/people/features/employees/services/employeeService.ts`

```typescript
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { EmployeeSchema, type Employee } from '../schemas';

export const employeeService = {
  /**
   * Get all employees with validation
   * Catches data drift from Firestore
   */
  async getAll(): Promise<Employee[]> {
    const snap = await getDocs(collection(db, 'employees'));

    const results = snap.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };

      // ✅ Validate data from Firestore
      const validation = EmployeeSchema.safeParse(data);

      if (!validation.success) {
        // Log invalid data for debugging
        console.error(
          `Invalid employee data (ID: ${doc.id}):`,
          validation.error.issues
        );
        return null; // Filter out invalid entries
      }

      return validation.data; // Type-safe!
    });

    return results.filter(Boolean) as Employee[];
  },

  /**
   * Get single employee by ID
   */
  async getById(id: string): Promise<Employee | null> {
    const docSnap = await getDoc(doc(db, 'employees', id));
    
    if (!docSnap.exists()) return null;

    const data = { id: docSnap.id, ...docSnap.data() };
    const validation = EmployeeSchema.safeParse(data);

    if (!validation.success) {
      console.error(`Invalid employee ${id}:`, validation.error);
      return null;
    }

    return validation.data;
  }
};
```

**Benefits:**
- Catches schema drift from database
- Prevents corrupted data from breaking UI
- Provides debugging information
- Type-safe return values

**When to Use:**
- Always on Firestore reads
- Especially important after schema changes
- Critical for migrated/imported data

---

### Layer 3: Cloud Functions Validation (API Input)

**File:** `functions/src/api/employees/createEmployee.ts`

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from '../../config/firebase-admin';
import { checkUserPermission } from '../rbac/checkUserPermission';

// ✅ Import the same schema used in frontend
import { CreateEmployeeSchema } from '@/domains/people/features/employees/schemas';

/**
 * Create Employee Cloud Function
 * ✅ Validates req.data before processing
 */
export const createEmployee = onCall(
  { 
    region: 'asia-southeast1',
    enforceAppCheck: true 
  },
  async (req) => {
    // 1. Authentication check
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Login required');
    }

    // 2. Authorization check (RBAC)
    const hasPermission = await checkUserPermission(
      req.auth.uid,
      'employees',
      'create'
    );

    if (!hasPermission) {
      throw new HttpsError(
        'permission-denied',
        'You do not have permission to create employees'
      );
    }

    // 3. ✅ Validate input with Zod
    const validation = CreateEmployeeSchema.safeParse(req.data);

    if (!validation.success) {
      // Return detailed validation errors to client
      throw new HttpsError(
        'invalid-argument',
        'Invalid employee data',
        validation.error.issues
      );
    }

    // 4. Use validated data (100% type-safe)
    const employeeData = validation.data;

    try {
      // 5. Create Firebase Auth user
      const userRecord = await admin.auth().createUser({
        email: employeeData.email,
        password: generateTempPassword(),
        displayName: `${employeeData.firstName} ${employeeData.lastName}`,
      });

      // 6. Create Firestore document
      const employeeDoc = {
        id: `emp-${userRecord.uid}`,
        userId: userRecord.uid,
        ...employeeData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        tenantId: 'default',
      };

      await db.collection('employees').doc(employeeDoc.id).set(employeeDoc);

      return {
        success: true,
        employeeId: employeeDoc.id,
        userId: userRecord.uid,
      };

    } catch (error) {
      console.error('Failed to create employee:', error);
      throw new HttpsError('internal', 'Failed to create employee');
    }
  }
);
```

**Benefits:**
- Prevents malformed data from reaching database
- Consistent validation with frontend
- Clear error messages for debugging
- Type-safe business logic

**Critical Notes:**
- ALWAYS validate `req.data` before processing
- Use `.safeParse()` not `.parse()` to handle errors gracefully
- Return validation errors to client for debugging
- This is your last line of defense before database

---

### Layer 4: Firestore Security Rules Validation

**File:** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================
    // Helper Functions - RBAC
    // ============================================

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() 
        && get(/databases/$(database)/documents/users/$(request.auth.uid))
           .data.role == 'admin';
    }

    function isHR() {
      let userRole = get(/databases/$(database)/documents/users/$(request.auth.uid))
                     .data.role;
      return isAuthenticated() && (userRole == 'hr' || userRole == 'admin');
    }

    // ============================================
    // Helper Functions - Employee Validation
    // ✅ Mirrors EmployeeSchema from Zod
    // ============================================

    function isValidEmployeeData(data) {
      // Required fields (mirror Zod schema)
      let hasRequiredFields = data.keys().hasAll([
        'id',
        'firstName',
        'lastName',
        'email',
        'status',
        'employmentType',
        'workType',
        'tenantId',
        'createdAt',
        'updatedAt'
      ]);

      // Field type validations
      let validTypes = 
        data.firstName is string &&
        data.lastName is string &&
        data.email is string &&
        data.status in ['active', 'on-leave', 'resigned', 'terminated'] &&
        data.employmentType in ['permanent', 'contract', 'probation', 'temporary'] &&
        data.workType in ['full-time', 'part-time', 'contract'] &&
        data.tenantId is string;

      // Field constraints (mirror Zod min/max)
      let validConstraints =
        data.firstName.size() >= 2 &&
        data.firstName.size() <= 100 &&
        data.lastName.size() >= 2 &&
        data.lastName.size() <= 100 &&
        data.email.matches('.*@.*\\..*'); // Basic email format

      // Optional fields validation (if present)
      let validOptionalFields =
        (!data.keys().hasAny(['phoneNumber']) || data.phoneNumber is string) &&
        (!data.keys().hasAny(['dateOfBirth']) || data.dateOfBirth is timestamp) &&
        (!data.keys().hasAny(['salary']) || (
          data.salary.baseSalary is number &&
          data.salary.baseSalary >= 0
        ));

      return hasRequiredFields 
        && validTypes 
        && validConstraints 
        && validOptionalFields;
    }

    // ============================================
    // Employees Collection Rules
    // ============================================

    match /employees/{employeeId} {
      // Read: All authenticated users (for UI display)
      allow read: if isAuthenticated();

      // Create: HR and Admin only + data validation
      allow create: if isHR()
        && isValidEmployeeData(request.resource.data)
        && request.resource.data.id == employeeId // ID must match document path
        && request.resource.data.tenantId == 'default'; // Multi-tenant check

      // Update: HR and Admin only + data validation
      allow update: if isHR()
        && isValidEmployeeData(request.resource.data)
        && request.resource.data.id == resource.data.id // Cannot change ID
        && request.resource.data.tenantId == resource.data.tenantId; // Cannot change tenant

      // Delete: Admin only
      allow delete: if isAdmin();
    }
  }
}
```

**Benefits:**
- Database-level validation (last line of defense)
- Prevents direct Firestore writes from bypassing validation
- Enforces RBAC at database level
- Catches bugs in Cloud Functions

**Critical Notes:**
- Rules MUST mirror Zod schema exactly
- Test with emulator before deploying
- Any mismatch causes `PERMISSION_DENIED` errors
- Update rules whenever Zod schema changes

---

### Keeping Layers Synchronized

**The Golden Rule:** When you change a Zod schema, update ALL layers:

1. ✅ Update Zod schema in `schemas/` directory
2. ✅ Frontend forms automatically get new validation
3. ✅ Service layer validation is automatic (uses same schema)
4. ✅ Update Cloud Functions (if input schema changed)
5. ✅ Update Firestore Rules (mirror new validation logic)
6. ✅ Test all layers with emulator

**Example: Adding a new required field**

Let's say you need to make `departmentId` required (was optional):

**Step 1: Update Zod Schema**
```typescript
// ✅ src/domains/people/features/employees/schemas/index.ts
export const EmployeeSchema = z.object({
  // ...
  departmentId: z.string().min(1), // Changed from .optional() to required
  // ...
});
```

**Step 2: Frontend (Automatic)**
```typescript
// ✅ Form validation automatically requires departmentId
// No code changes needed if using zodResolver
```

**Step 3: Service Layer (Automatic)**
```typescript
// ✅ safeParse() will now reject employees without departmentId
// No code changes needed
```

**Step 4: Update Cloud Functions (if needed)**
```typescript
// ✅ If using CreateEmployeeSchema.pick(), update the pick list
const createEmployeeInput = CreateEmployeeSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  departmentId: true, // ✅ Add to pick list
});
```

**Step 5: Update Firestore Rules**
```javascript
// ✅ firestore.rules
function isValidEmployeeData(data) {
  let hasRequiredFields = data.keys().hasAll([
    'id', 'firstName', 'lastName', 'email',
    'departmentId', // ✅ Add to required fields
    // ...
  ]);

  let validTypes =
    // ...
    data.departmentId is string && // ✅ Add type check
    data.departmentId.size() >= 1; // ✅ Add constraint

  return hasRequiredFields && validTypes;
}
```

**Step 6: Data Migration (if needed)**
```typescript
// ⚠️ If existing data lacks departmentId, run migration first!
// See Step 6: Schema Evolution & Data Migration Strategy
```

---

### Testing All Layers

**1. Unit Tests (Zod Schema)**
```typescript
import { EmployeeSchema } from './schemas';

describe('EmployeeSchema', () => {
  it('should accept valid employee data', () => {
    const validData = {
      id: 'emp-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      // ...
    };
    expect(() => EmployeeSchema.parse(validData)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const invalidData = {
      id: 'emp-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'not-an-email', // ❌ Invalid
      // ...
    };
    expect(() => EmployeeSchema.parse(invalidData)).toThrow();
  });
});
```

**2. Integration Tests (Cloud Functions)**
```typescript
import { createEmployee } from './createEmployee';

describe('createEmployee', () => {
  it('should reject invalid payload', async () => {
    const invalidPayload = { firstName: 'A' }; // ❌ Too short + missing fields

    await expect(
      createEmployee({ auth: mockAuth, data: invalidPayload })
    ).rejects.toThrow('invalid-argument');
  });
});
```

**3. Firestore Rules Tests**
```typescript
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

describe('Employee Rules', () => {
  it('should allow HR to create valid employee', async () => {
    const validEmployee = { /* valid data */ };
    await assertSucceeds(
      db.collection('employees').doc('emp-123').set(validEmployee)
    );
  });

  it('should reject invalid employee data', async () => {
    const invalidEmployee = { firstName: 'A' }; // ❌ Missing required fields
    await assertFails(
      db.collection('employees').doc('emp-123').set(invalidEmployee)
    );
  });
});
```

---

### Common Pitfalls

**❌ Pitfall 1: Skipping Service Layer Validation**
```typescript
// ❌ BAD: No validation on Firestore read
const employees = await getDocs(collection(db, 'employees'));
return employees.docs.map(doc => doc.data()); // Unsafe!
```

**✅ Solution:**
```typescript
// ✅ GOOD: Always validate Firestore reads
const employees = await getDocs(collection(db, 'employees'));
return employees.docs.map(doc => {
  const validation = EmployeeSchema.safeParse(doc.data());
  return validation.success ? validation.data : null;
}).filter(Boolean);
```

---

**❌ Pitfall 2: Firestore Rules Not Updated**
```typescript
// ✅ Updated Zod schema (added required field)
departmentId: z.string().min(1),

// ❌ Firestore Rules not updated (still allows missing departmentId)
// Result: Cloud Function validation passes, but Firestore write fails!
```

**✅ Solution:** Always update Firestore Rules to mirror Zod changes.

---

**❌ Pitfall 3: Using .parse() in Cloud Functions**
```typescript
// ❌ BAD: Throws unhandled error
const data = CreateEmployeeSchema.parse(req.data); // Crashes function!
```

**✅ Solution:**
```typescript
// ✅ GOOD: Use safeParse and handle errors
const validation = CreateEmployeeSchema.safeParse(req.data);
if (!validation.success) {
  throw new HttpsError('invalid-argument', 'Invalid data', validation.error);
}
```

---

### Summary Checklist

For every Zod schema in your codebase, ensure:

- [ ] **Layer 1:** Frontend forms use `zodResolver`
- [ ] **Layer 2:** Service layer uses `safeParse()` on all reads
- [ ] **Layer 3:** Cloud Functions validate `req.data` with `safeParse()`
- [ ] **Layer 4:** Firestore Rules mirror Zod validation logic
- [ ] **Layer 5:** All types inferred from Zod (no manual interfaces)
- [ ] **Tests:** Unit tests for schema, integration tests for Functions, Rules tests
- [ ] **Documentation:** Schema changes documented and team notified

---

**Next:** See `@/docs/ZOD_VALIDATION_ROADMAP.md` for complete implementation plan.
