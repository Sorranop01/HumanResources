Purpose: Define the complete folder structure and coding principles for AI to build scalable React applications using Feature-Slice Design within a Vite + TypeScript monorepo.

🇬🇧 Section 1: AI Coding Rules (for AI to follow)

1. Architectural Principle

Follow Feature-Slice Design (FSD) strictly.

Every feature lives inside a domain (e.g. people, auth, products).

Each domain contains its own features, components, hooks, services, and types.

AI must never mix logic between domains or import cross-domain files directly.
→ Use @/shared/ packages for shared code only.

2. Folder Structure Template
   src/
   ├── domains/ # Business logic separated by domain
   │ ├── people/
   │ │ ├── features/
   │ │ │ ├── employees/
   │ │ │ │ ├── components/
   │ │ │ │ ├── hooks/
   │ │ │ │ ├── services/
   │ │ │ │ ├── schemas/ <-- Data Models are defined AND exported here
   │ │ │ │ └── (types/ folder is only for UI-specific props, not data models)
   │ │ └── index.ts
   Note on SSOT: As per 10-Single-Source-of-Truth-Zod.md, all data model types (like Employee) must be inferred from Zod schemas located in the schemas/ folder. The types/ folder is deprecated for this purpose and should only be used for UI-related types (e.g., component props) if necessary.

3. Import Rules

AI must use alias imports, not relative paths:

import { formatMoney } from '@/shared/lib/format';
import { EmployeeCard } from '@/domains/people/features/employees/components/EmployeeCard';

Never write deep relative imports such as ../../../.

4. Component Rules

UI components inside shared/ui/ must be:

Presentational only

Reusable across features

Not dependent on domain logic

Feature components inside domains/<domain>/features/.../components/ can use:

Local hooks, schemas, and services from the same feature

Shared components from @/shared/ui

Example:

// src/domains/people/features/employees/components/EmployeeCard.tsx
import { Card, Tag } from 'antd';
import type { FC } from 'react';
import type { Employee } from '@/shared/types';

export const EmployeeCard: FC<{ employee: Employee }> = ({ employee }) => (
<Card hoverable>
<p>{employee.firstName} {employee.lastName}</p>
<Tag color="blue">{employee.role}</Tag>
</Card>
);

5. Hook Rules

Hooks belong in the hooks/ directory within the feature.

Hook naming convention: useFeatureAction (e.g. useCreateEmployee, useDeleteEmployee).

Hooks must not contain JSX.
→ If JSX is needed (e.g. using Modal.confirm with icons), the file must be .tsx.

6. Service Rules

Services handle API requests or external integration.

Each feature must have its own service file for clarity.

Use Firebase, Axios, or Fetch consistently across the project (depending on setup).

Always separate:

employee.service.ts → CRUD functions

employee.keys.ts → React Query keys or constants

Example:

// employee.service.ts
import { db } from '@/shared/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const employeeService = {
async getAll() {
const snapshot = await getDocs(collection(db, 'employees'));
return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
},
};

7. Schema and Validation

Schemas define validation using zod or yup.

Each form or API input must have its schema defined in schemas/.

import { z } from 'zod';

export const EmployeeFormSchema = z.object({
firstName: z.string().min(1),
lastName: z.string().min(1),
position: z.string(),
});
export type EmployeeFormInput = z.infer<typeof EmployeeFormSchema>;

8. Communication Between Layers

Feature → Shared: ✅ Allowed

Shared → Feature: ❌ Not allowed

Feature A → Feature B: ❌ Not allowed

Cross-domain logic must be refactored into @/shared/
or a new core/ package if many domains depend on it.

9. Domain Entry Files

Each domain may have an index.ts exporting only high-level public functions, e.g.:

export { employeeService } from './features/employees/services/employee.service';
export { EmployeeCard } from './features/employees/components/EmployeeCard';

10. Testing and Maintainability

Each domain is self-contained and can be tested independently.

No circular imports allowed.

Each feature should be deployable or removable without breaking others.
