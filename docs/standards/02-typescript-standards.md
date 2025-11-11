Purpose: Define clear rules for AI to write safe, scalable, and maintainable TypeScript code in a React + Vite environment.

🇬🇧 Section 1: AI Coding Rules (for AI to follow)
1. General TypeScript Setup

The project must run in strict mode.
→ Always assume strict type checks are enabled (strict: true in tsconfig.json).

Never use any. Use unknown, never, or define custom interfaces/types instead.

Always export explicit types from domain or shared modules, e.g.:

export type Employee = { id: string; name: string; position: string };


Never rely on implicit any or type inference in API responses. Use defined interfaces.

2. Type Declaration Rules

Prefer type over interface for objects and function types unless extension is required.

type Employee = { id: string; name: string };
interface Service { getAll(): Promise<Employee[]>; }


Use interface only when you need inheritance (extends).

For unions and discriminated types:

type Role = 'admin' | 'hr' | 'employee';


Use readonly when appropriate for immutable data.

Define exact field types, not just string for everything.

3. Function and Component Typing

Always type function parameters and return values:

const formatMoney = (value: number): string => value.toLocaleString('th-TH');


For React components:

import type { FC } from 'react';

interface EmployeeCardProps {
  name: string;
  position: string;
}

export const EmployeeCard: FC<EmployeeCardProps> = ({ name, position }) => (
  <div>{name} — {position}</div>
);


Hooks:

export const useEmployee = (): { data: Employee[] } => { ... };

4. Generics and Utility Types

Use generics to enforce type reusability:

function fetchData<T>(endpoint: string): Promise<T> { ... }


Built-in utilities allowed:
Partial, Pick, Omit, Record, Readonly, ReturnType, Awaited.

Example:

type CreateEmployeeInput = Omit<Employee, 'id' | 'createdAt'>;

5. Type Imports and Export Rules

Always import types using import type:

import type { Employee } from '@/shared/types';


Group all exported types at the bottom of a file:

export type { Employee, EmployeeFormInput };

6. Error Handling and Type Safety

Avoid unsafe type assertions (as any, as unknown as Type).

If using optional chaining (?.), handle undefined cases explicitly.

Never suppress compiler errors with // @ts-ignore unless absolutely necessary.

When returning from a function, always specify return type explicitly.

7. Enum and Constant Usage

Prefer union types over enum for lightweight cases:

type Status = 'active' | 'inactive' | 'terminated';


Use enum only for large constant sets that must map to numeric or string keys.

8. Type File Organization

Shared or reusable types → @/shared/types/

Domain-specific types → src/domains/<domain>/types/

Never define types inline within large components or functions (declare separately and import).