# Employee Feature Structure Overview

## Executive Summary

The current employee feature provides a comprehensive employee management system built with React, TypeScript, Firestore, and cloud functions. It follows a domain-driven architecture with clear separation of concerns and type-safe validation using Zod.

---

## 1. CURRENT TYPE DEFINITIONS

**Location:** `/src/domains/people/features/employees/types/index.ts`

### Primary Type: Employee

```typescript
export interface Employee extends BaseEntity {
  userId: string;              // Firebase user reference
  employeeCode: string;        // Unique employee identifier
  firstName: string;           // English first name
  lastName: string;            // English last name
  thaiFirstName: string;       // Thai first name
  thaiLastName: string;        // Thai last name
  email: string;               // Email address
  phoneNumber: string;         // 9-10 digit phone number
  dateOfBirth: Date;          // Birth date
  hireDate: Date;             // Employment start date
  position: string;            // Job position/title
  department: string;          // Department assignment
  salary: number;              // Monthly salary in Thai Baht
  status: EmployeeStatus;      // Current employment status
  photoURL?: string;           // Optional profile photo
}
```

### Employee Status Type

```typescript
export type EmployeeStatus = 'active' | 'on-leave' | 'resigned' | 'terminated';
```

### Status Meanings
- **active**: Currently employed and working
- **on-leave**: On temporary leave
- **resigned**: Employee has resigned
- **terminated**: Employment has been terminated

### BaseEntity Extension
The Employee type extends `BaseEntity` (from `/src/shared/types`), which provides:
- `id: string` - Document ID
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Last update timestamp

---

## 2. CURRENT SCHEMAS (Zod Validation)

**Location:** `/src/domains/people/features/employees/schemas/index.ts`

### Available Schemas

#### EmployeeSchema
- **Purpose**: Complete employee record validation (from database)
- **Fields**: All fields including id and timestamps
- **Usage**: Validating full employee documents from Firestore

#### CreateEmployeeSchema
- **Purpose**: Validation for employee creation
- **Omitted Fields**: id, userId, createdAt, updatedAt
- **Usage**: API calls to create new employees

#### UpdateEmployeeSchema
- **Purpose**: Partial updates with required id
- **Required Fields**: id only
- **Optional Fields**: All other fields (partial update)
- **Usage**: API calls to update existing employees

#### EmployeeFormSchema
- **Purpose**: Client-side form validation
- **Special Handling**: 
  - Dates as ISO strings (from form inputs)
  - No id, userId, timestamps
  - Number coercion for salary field
- **Validation Rules**:
  - `phoneNumber`: regex validation (9-10 digits)
  - `salary`: positive number, multipleOf 0.01
  - Thai text messages for error validation

#### EmployeeFiltersSchema
- **Purpose**: Filter parameters for employee queries
- **Optional Fields**: status, department, position, search
- **Usage**: Filtering employee lists

### Helper Functions

```typescript
// Throws on validation error
validateEmployee(data: unknown): Employee

// Safe validation without throwing
safeValidateEmployee(data: unknown): { data: Employee | null; error: ZodError | null }

// Convert form data (string dates) to create input (Date objects)
formDataToCreateInput(formData: EmployeeFormInput): Omit<CreateEmployeeInput, 'userId'>
```

---

## 3. COMPONENTS & FUNCTIONALITY

**Location:** `/src/domains/people/features/employees/components/`

### EmployeeTable Component
**File**: `EmployeeTable.tsx`

**Purpose**: Display employees in tabular format

**Features**:
- Server-side pagination (10 items per page)
- Status color coding (green/orange/red/volcano)
- Thai date formatting
- Money formatting for salary
- Action buttons: View & Edit
- Loading state

**Columns**:
- รหัสพนักงาน (Employee Code)
- ชื่อ-นามสกุล (Full Name - English)
- แผนก (Department)
- ตำแหน่ง (Position)
- เงินเดือน (Salary)
- วันเริ่มงาน (Hire Date)
- สถานะ (Status)
- จัดการ (Actions)

**Dependencies**:
- `useEmployees` hook for data fetching
- Ant Design Table, Button, Space, Tag components

---

### EmployeeForm Component
**File**: `EmployeeForm.tsx`

**Purpose**: Reusable form for creating/editing employees

**Features**:
- React Hook Form + Zod validation
- Responsive grid layout (xs, sm, md breakpoints)
- Date picker with Thai formatting
- Select dropdowns for departments/positions
- Number input with thousand separator formatting
- Optional photo URL field

**Form Fields** (3-column layout):
1. Employee Code
2. Status (Select)
3. First Name (English)
4. Last Name (English)
5. First Name (Thai)
6. Last Name (Thai)
7. Email
8. Phone Number
9. Date of Birth (DatePicker)
10. Hire Date (DatePicker)
11. Department (Select)
12. Position (Select)
13. Salary (InputNumber)
14. Photo URL (full width, optional)

**Props**:
```typescript
interface EmployeeFormProps {
  initialData?: Employee;                    // For edit mode
  onSubmit: (data: EmployeeFormInput) => void | Promise<void>;
  loading?: boolean;                         // Loading state
  submitText?: string;                       // Button text (default: 'บันทึก')
}
```

**Hardcoded Data**:
```typescript
DEPARTMENTS: ['ฝ่ายบุคคล', 'ฝ่ายการเงิน', 'ฝ่ายขาย', 'ฝ่ายการตลาด', 'ฝ่ายไอที', 'ฝ่ายปฏิบัติการ', 'ฝ่ายผลิต']
POSITIONS: ['ผู้จัดการ', 'หัวหน้าแผนก', 'พนักงานอาวุโส', 'พนักงาน', 'พนักงานฝึกหัด', 'ที่ปรึกษา']
```

---

### EmployeeCard Component
**File**: `EmployeeCard.tsx`

**Purpose**: Card-based display of employee information

**Features**:
- Avatar display (with fallback icon)
- Name display (English & Thai)
- Status and code tags
- Configurable details section
- Customizable action slots

**Displayed Details**:
- Email (clickable mailto link)
- Phone (clickable tel link)
- Department
- Position
- Salary
- Hire Date

**Props**:
```typescript
interface EmployeeCardProps {
  employee: Employee;
  showDetails?: boolean;        // Toggle details section
  actions?: React.ReactNode;    // Custom action buttons
}
```

---

### EmployeeFilters Component
**File**: `EmployeeFilters.tsx`

**Purpose**: Filter controls for employee lists

**Features**:
- Search by name, code, or email
- Status filter dropdown
- Department filter with search
- Position filter with search
- Clear filters button
- Loading state handling

**Filter Options**:
- Search: Text input
- Status: active, on-leave, resigned, terminated
- Department: All hardcoded departments
- Position: All hardcoded positions

---

## 4. SERVICES & API STRUCTURE

**Location:** `/src/domains/people/features/employees/services/employeeService.ts`

### Query Keys (TanStack Query)
```typescript
employeeKeys.all              // Base key: ['employees']
employeeKeys.lists()          // Lists scope
employeeKeys.list(filters)    // Specific list with filters
employeeKeys.details()        // Details scope
employeeKeys.detail(id)       // Specific employee detail
```

### Service Methods

#### getAll(filters?: EmployeeFilters): Promise<Employee[]>
**Purpose**: Fetch all employees with optional filters

**Filters Applied**:
- `status` - Exact match filter
- `department` - Exact match filter
- `position` - Exact match filter

**Features**:
- Default ordering by createdAt descending
- Zod validation for each document
- Error handling and logging
- Timestamp conversion (Firestore to Date)

**Error**: Throws "ไม่สามารถดึงข้อมูลพนักงานได้" (Cannot fetch employees)

---

#### getById(id: string): Promise<Employee | null>
**Purpose**: Fetch a single employee by ID

**Features**:
- Returns null if employee not found
- Zod validation
- Timestamp conversion
- Error handling

**Error**: Throws "ข้อมูลพนักงานไม่ถูกต้อง" (Invalid employee data)

---

#### create(payload: { password?: string; employeeData: EmployeeFormInput }): Promise<unknown>
**Purpose**: Create a new employee via Cloud Function

**Cloud Function**: `createEmployee` (Firebase Functions)

**Features**:
- Creates Firebase user account with email & password
- Creates employee document in Firestore
- Converts form dates to Date objects
- Returns result from cloud function

**Requirements**:
- Password must be provided
- Email must be valid

**Error**: Throws "ไม่สามารถสร้างข้อมูลพนักงานได้" (Cannot create employee)

---

#### update(id: string, data: Partial<Employee>): Promise<void>
**Purpose**: Update an existing employee

**Features**:
- Removes id and createdAt from update data
- Automatically sets updatedAt timestamp
- Firestore updateDoc operation

**Error**: Throws "ไม่สามารถอัปเดตข้อมูลพนักงานได้" (Cannot update employee)

---

#### softDelete(id: string): Promise<void>
**Purpose**: Soft delete - marks employee as terminated

**Features**:
- Sets status to 'terminated'
- Updates updatedAt timestamp
- Data is not actually deleted from Firestore

---

#### delete(id: string): Promise<void>
**Purpose**: Hard delete - permanently removes employee

**Warning**: This operation is irreversible

---

#### isEmployeeCodeExists(code: string, excludeId?: string): Promise<boolean>
**Purpose**: Check if employee code is unique

**Features**:
- Optional exclude ID for edit operations
- Returns false on error (graceful failure)

---

#### search(keyword: string): Promise<Employee[]>
**Purpose**: Search employees by keyword

**Scope**: Searches full name (English & Thai), email, and employee code

**Note**: Client-side search - for production, consider Algolia or Firebase Extension

**Case**: Case-insensitive matching

---

## 5. HOOKS (React Query Integration)

**Location:** `/src/domains/people/features/employees/hooks/`

### useEmployees(filters?: EmployeeFilters)
**Purpose**: Query all employees with optional filters

**Cache Settings**:
- staleTime: 5 minutes
- retry: 2 attempts

**Returns**: `UseQueryResult<Employee[], Error>`

---

### useEmployee(id: string | undefined)
**Purpose**: Query a single employee by ID

**Features**:
- Conditional query (enabled only if id is provided)
- Returns null if employee not found

**Cache Settings**:
- staleTime: 5 minutes
- retry: 2 attempts

---

### useCreateEmployee()
**Purpose**: Mutation hook for creating employees

**Features**:
- Auto-invalidates employee lists on success
- Shows success/error messages via Ant Design
- Success Message: "เพิ่มพนักงานสำเร็จ"
- Error Message: "เพิ่มพนักงานไม่สำเร็จ: {error}"

---

### useUpdateEmployee()
**Purpose**: Mutation hook for updating employees

**Features**:
- Invalidates both list and specific detail queries
- Success/error messages
- Success Message: "อัปเดตพนักงานสำเร็จ"
- Error Message: "อัปเดตพนักงานไม่สำเร็จ: {error}"

---

### useDeleteEmployee()
**Purpose**: Mutation hook for soft-deleting employees

**Features**:
- Soft delete (sets status to 'terminated')
- Cache invalidation
- Success Message: "ลบพนักงานสำเร็จ"
- Error Message: "ลบพนักงานไม่สำเร็จ: {error}"

---

## 6. PAGES

**Location:** `/src/domains/people/features/employees/pages/`

### EmployeeListPage
- Main employee listing with filters
- Uses `EmployeeTable` and `EmployeeFilters` components
- Filter state management
- Navigation to detail/edit pages

### EmployeeDetailPage
- Display single employee information
- Uses `EmployeeCard` component
- Action buttons for edit/delete
- Related data tabs (when extended)

### EmployeeCreatePage
- Form for creating new employees
- Uses `EmployeeForm` component
- Password field for user account creation
- Navigation on success

### EmployeeEditPage
- Form for editing existing employees
- Fetches current employee data
- Pre-fills form with existing values
- Update on submission

---

## 7. DIRECTORY STRUCTURE

```
src/domains/people/features/employees/
├── components/
│   ├── EmployeeCard.tsx              # Card display component
│   ├── EmployeeFilters.tsx           # Filter controls component
│   ├── EmployeeForm.tsx              # Reusable form component
│   └── EmployeeTable.tsx             # Table display component
├── hooks/
│   ├── useCreateEmployee.ts          # Create mutation hook
│   ├── useDeleteEmployee.tsx         # Delete mutation hook
│   ├── useEmployee.ts                # Single employee query hook
│   ├── useEmployees.ts               # All employees query hook
│   └── useUpdateEmployee.ts          # Update mutation hook
├── pages/
│   ├── EmployeeCreatePage.tsx        # Create page
│   ├── EmployeeDetailPage.tsx        # Detail page
│   ├── EmployeeEditPage.tsx          # Edit page
│   └── EmployeeListPage.tsx          # List page
├── services/
│   └── employeeService.ts            # Firebase service & query keys
├── schemas/
│   └── index.ts                      # Zod validation schemas
├── types/
│   └── index.ts                      # TypeScript type definitions
└── index.ts                          # Public API exports
```

---

## 8. TECHNICAL STACK

### Core Technologies
- **React** - UI framework
- **TypeScript** - Type safety
- **React Hook Form** - Form state management
- **Zod** - Runtime validation
- **TanStack Query** - Server state management
- **Ant Design** - Component library
- **Firestore** - Database
- **Firebase Functions** - Backend logic
- **dayjs** - Date manipulation

### Key Patterns
- Domain-driven architecture
- Service layer pattern
- Query/Mutation hooks pattern
- Zod schema-first validation
- Type-safe form handling

---

## 9. INTERNATIONALIZATION (i18n)

### Thai Language Support
- All UI labels in Thai language
- Thai date formatting (via `formatThaiDate`)
- Thai error messages from Zod schemas
- Form validation messages in Thai
- Status labels in Thai

### Hardcoded Data
- Departments list
- Position titles
- Status labels

---

## 10. CURRENT LIMITATIONS & NOTES

### Search
- Full-text search is client-side (no Firestore full-text support)
- For production, consider Algolia or Firebase Extensions

### Departments & Positions
- Hardcoded in components
- Not database-driven (opportunity for centralization)

### Photo URLs
- Only accepts external URLs
- No image upload functionality

### Phone Numbers
- Validation: 9-10 Thai digits
- No international format support

### Status Management
- No workflow validation (e.g., can't go from resigned -> active)

### Employee Code
- Unique constraint check via service method
- No automatic generation

---

## 11. EXTENSION POINTS FOR NEW FEATURES

### Salary Calculation Feature
**Related Fields**: salary, hireDate, status

**Suggested Structure**:
```
src/domains/people/features/salary/
├── types/
│   └── index.ts           # SalaryInfo, SalaryCalculation types
├── schemas/
│   └── index.ts           # Zod schemas for salary
├── services/
│   └── salaryService.ts   # Calculation logic
├── hooks/
│   └── useSalaryInfo.ts   # Query hook
└── components/
    └── SalarySection.tsx  # UI component
```

**Database Collection**: `employees/{id}/salary` or top-level `salaries` collection

**Key Considerations**:
- Link to employee.salary base field
- Tax calculations
- Deduction tracking
- Payment history

---

### Social Security Feature
**Related Fields**: salary, hireDate, status, phoneNumber

**Suggested Structure**:
```
src/domains/people/features/socialSecurity/
├── types/
│   └── index.ts           # SSN, SocialSecurityInfo types
├── schemas/
│   └── index.ts           # Zod validation
├── services/
│   └── ssService.ts       # SS logic & API calls
├── hooks/
│   └── useSocialSecurity.ts
└── components/
    └── SocialSecuritySection.tsx
```

**Database Collection**: `employees/{id}/socialSecurity` or `socialSecurity`

**Key Considerations**:
- Registration number
- Contribution rates (employee + employer)
- Enrollment date
- Status (active, ceased, etc.)

---

### Leave Entitlements Feature
**Related Fields**: hireDate, status, position, department

**Suggested Structure**:
```
src/domains/people/features/leave/
├── types/
│   └── index.ts           # LeaveType, LeaveEntitlement types
├── schemas/
│   └── index.ts           # Zod validation
├── services/
│   └── leaveService.ts    # Leave logic
├── hooks/
│   └── useLeaveEntitlements.ts
└── components/
    └── LeaveEntitlementCard.tsx
```

**Database Collections**:
- `leaveTypes` - Master data (Sick, Annual, Personal, etc.)
- `employees/{id}/leaveEntitlements` - Employee allocations
- `employees/{id}/leaveRequests` - Leave requests

**Key Considerations**:
- Annual leave calculation (pro-rata based on hire date)
- Leave year definition (calendar vs fiscal)
- Leave carryover rules
- Maximum accrual limits

---

### Sick Leave Feature
**Related Fields**: hireDate, status, leaveEntitlements

**Suggested Structure**:
```
src/domains/people/features/sickLeave/
├── types/
│   └── index.ts           # SickLeave, SickLeaveRecord types
├── schemas/
│   └── index.ts           # Zod validation
├── services/
│   └── sickLeaveService.ts
├── hooks/
│   └── useSickLeaveRecords.ts
└── components/
    └── SickLeaveHistory.tsx
```

**Database Collection**: `employees/{id}/sickLeave` or `sickLeaveRecords`

**Key Considerations**:
- Integration with leave entitlements
- Medical certificate requirements
- Carryover rules
- Consecutive leave limits
- Different rules for different tenures

---

## 12. RECOMMENDED ARCHITECTURE FOR EXTENSIONS

### Pattern for New Employee-Related Features

1. **Create Feature Module**
   ```
   src/domains/people/features/{featureName}/
   ├── types/index.ts
   ├── schemas/index.ts
   ├── services/{featureName}Service.ts
   ├── hooks/
   │   ├── use{Feature}.ts
   │   └── use{Feature}List.ts
   ├── components/
   │   ├── {Feature}Card.tsx
   │   └── {Feature}Form.tsx
   └── index.ts
   ```

2. **Database Design**
   - Store at top-level: `feature/{documentId}`
   - Or nested: `employees/{employeeId}/feature/{documentId}`
   - Use subcollections for child relationships

3. **Service Pattern**
   - CRUD methods (getAll, getById, create, update, delete)
   - Query key factory for TanStack Query
   - Timestamp conversion helpers
   - Zod validation integration

4. **Hook Pattern**
   - Query hooks with staleTime & retry config
   - Mutation hooks with cache invalidation
   - Ant Design message integration

5. **Component Pattern**
   - Display components (Card, Table, Details)
   - Form components with react-hook-form + Zod
   - Filter components for lists

---

## 13. API SUMMARY

### Public Exports (via index.ts)

**Components**:
- EmployeeCard
- EmployeeFiltersComponent
- EmployeeForm
- EmployeeTable

**Hooks**:
- useCreateEmployee
- useDeleteEmployee
- useEmployee
- useEmployees
- useUpdateEmployee

**Pages**:
- EmployeeCreatePage
- EmployeeDetailPage
- EmployeeEditPage
- EmployeeListPage

**Schemas & Types**:
- CreateEmployeeInput (type)
- EmployeeFiltersType (type)
- EmployeeFormInput (type)
- UpdateEmployeeInput (type)
- CreateEmployeeSchema
- EmployeeFiltersSchema
- EmployeeFormSchema
- EmployeeSchema
- EmployeeStatusSchema
- validateEmployee
- safeValidateEmployee
- formDataToCreateInput

**Services**:
- employeeKeys
- employeeService

**Types**:
- Employee
- EmployeeStatus

---

## 14. NEXT STEPS FOR FEATURE DEVELOPMENT

1. **Review this structure** with your team
2. **Create parallel features** following the same architecture pattern
3. **Share hardcoded data** (departments, positions) to a centralized config
4. **Consider database schema** for new collections
5. **Plan integration points** between features (e.g., salary uses employee.salary)
6. **Setup Cloud Functions** for complex backend logic
7. **Create shared utilities** for calculations (tax, deductions, etc.)
8. **Plan testing strategy** for new hooks and services

---

**Generated**: 2025-11-12
**Architecture Pattern**: Domain-Driven Design with Service Layer
**State Management**: TanStack Query + React Context (Auth via Firebase)
**Validation**: Zod (Schema-First)
