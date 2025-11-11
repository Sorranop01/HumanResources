# Employee Feature - Quick Reference Guide

## Type Definition at a Glance

```
Employee (extends BaseEntity)
├── userId: string
├── employeeCode: string (unique)
├── firstName: string (English)
├── lastName: string (English)
├── thaiFirstName: string
├── thaiLastName: string
├── email: string
├── phoneNumber: string (9-10 digits)
├── dateOfBirth: Date
├── hireDate: Date
├── position: string
├── department: string
├── salary: number (THB)
├── status: EmployeeStatus ('active' | 'on-leave' | 'resigned' | 'terminated')
├── photoURL?: string
├── id: string (from BaseEntity)
├── createdAt: Date (from BaseEntity)
└── updatedAt: Date (from BaseEntity)
```

---

## Data Flow Architecture

```
Pages (EmployeeListPage, DetailPage, CreatePage, EditPage)
    ↓
Hooks (useEmployees, useEmployee, useCreateEmployee, useUpdateEmployee)
    ↓
TanStack Query (caching, state management)
    ↓
Services (employeeService with CRUD operations)
    ↓
Firebase (Firestore database + Cloud Functions)

Forms ↔ Validation
Components (Form, Table, Card, Filters) ↔ Zod Schemas
```

---

## Component Hierarchy

```
EmployeeListPage
├── EmployeeFilters (filter controls)
├── EmployeeTable (data display)
│   ├── View action → EmployeeDetailPage
│   └── Edit action → EmployeeEditPage

EmployeeDetailPage
├── EmployeeCard (main display)
└── Action buttons (Edit, Delete)

EmployeeCreatePage
└── EmployeeForm (+ password field)

EmployeeEditPage
└── EmployeeForm (pre-filled)
```

---

## Validation Flow

```
User Form Input
    ↓ (EmployeeFormSchema validation)
EmployeeFormInput (string dates)
    ↓ (formDataToCreateInput conversion)
CreateEmployeeInput (Date objects)
    ↓ (Cloud Function)
Firebase User + Employee Document
    ↓ (validateEmployee / safeValidateEmployee)
Employee Object (type-safe)
```

---

## Service Methods Quick Reference

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `getAll(filters?)` | EmployeeFilters? | Employee[] | Fetch all with optional filters |
| `getById(id)` | string | Employee \| null | Fetch single employee |
| `create(payload)` | { password, employeeData } | unknown | Create new employee + user |
| `update(id, data)` | string, Partial<Employee> | void | Update employee |
| `softDelete(id)` | string | void | Mark as terminated |
| `delete(id)` | string | void | Permanently delete |
| `isEmployeeCodeExists(code, excludeId?)` | string, string? | boolean | Check unique code |
| `search(keyword)` | string | Employee[] | Client-side search |

---

## Query Cache Configuration

```
Query Stale Time: 5 minutes
Retry Attempts: 2
Query Keys Structure:
  - employeeKeys.all                    → ['employees']
  - employeeKeys.lists()                → ['employees', 'list']
  - employeeKeys.list(filters)          → ['employees', 'list', filters]
  - employeeKeys.details()              → ['employees', 'detail']
  - employeeKeys.detail(id)             → ['employees', 'detail', id]
```

---

## Hardcoded Data

### Departments
- ฝ่ายบุคคล (HR)
- ฝ่ายการเงิน (Finance)
- ฝ่ายขาย (Sales)
- ฝ่ายการตลาด (Marketing)
- ฝ่ายไอที (IT)
- ฝ่ายปฏิบัติการ (Operations)
- ฝ่ายผลิต (Production)

### Positions
- ผู้จัดการ (Manager)
- หัวหน้าแผนก (Department Head)
- พนักงานอาวุโส (Senior Employee)
- พนักงาน (Employee)
- พนักงานฝึกหัด (Trainee)
- ที่ปรึกษา (Consultant)

### Status Labels
| Status | Label | Color |
|--------|-------|-------|
| active | ทำงานอยู่ | green |
| on-leave | ลา | orange |
| resigned | ลาออก | red |
| terminated | เลิกจ้าง | volcano |

---

## Form Fields Layout (Responsive)

```
Desktop (3 columns):  | Tablet (2 columns): | Mobile (1 column):
emp code   status fname  emp code  status      emp code
lname      thaifname  email  fname  lname      status
thaifname  thalname  phone  thaifname  email  fname
dob        hiredate  dept  phone  thaifname  lname
position   salary    photo  dob  thaifname  email
                      hiredate  phone      phone
                      dept  dob        dob
                      position  hiredate  hiredate
                      salary  dept      dept
                      photo  position  position
                             salary    salary
                             photo     photo
```

---

## Error Handling & Messages

### Success Messages (Thai)
- Create: "เพิ่มพนักงานสำเร็จ"
- Update: "อัปเดตพนักงานสำเร็จ"
- Delete: "ลบพนักงานสำเร็จ"

### Error Messages (Thai)
- Fetch failed: "ไม่สามารถดึงข้อมูลพนักงานได้"
- Invalid data: "ข้อมูลพนักงานไม่ถูกต้อง"
- Create failed: "ไม่สามารถสร้างข้อมูลพนักงานได้"
- Update failed: "ไม่สามารถอัปเดตข้อมูลพนักงานได้"
- Delete failed: "ไม่สามารถลบข้อมูลพนักงานได้"
- Search failed: "ไม่สามารถค้นหาพนักงานได้"

---

## Integration Points for New Features

### Salary Calculation
- Reads: `employee.salary`, `employee.hireDate`, `employee.status`
- Writes: New collection `salaries` or subcollection `employees/{id}/salary`
- Calculations: Base salary, deductions, tax, net pay

### Social Security
- Reads: `employee.salary`, `employee.hireDate`, `employee.status`
- Writes: New collection `socialSecurity` or subcollection
- Data: Registration number, contribution rates, enrollment date

### Leave Entitlements
- Reads: `employee.hireDate`, `employee.status`, `employee.position`
- Writes: `leaveTypes` (master), `employees/{id}/leaveEntitlements`
- Calculations: Annual leave pro-rata, carryover, accrual

### Sick Leave
- Reads: `employee.hireDate`, `employee.status`, leave entitlements
- Writes: `employees/{id}/sickLeave` or `sickLeaveRecords`
- Rules: Medical cert requirements, consecutive limits, carryover

---

## Database Collections

### Current
```
firestore/
└── employees/
    ├── emp001 (Employee document)
    ├── emp002
    └── emp003
```

### Recommended for Extensions
```
firestore/
├── employees/
│   ├── emp001/
│   │   ├── salary/ (subcollection)
│   │   ├── socialSecurity/ (subcollection)
│   │   ├── leaveEntitlements/ (subcollection)
│   │   └── sickLeave/ (subcollection)
│   └── ...
├── leaveTypes/ (master data)
├── salaries/ (or nested above)
├── socialSecurity/ (or nested above)
└── sickLeaveRecords/ (or nested above)
```

---

## File Size & Complexity

| File | Lines | Purpose | Complexity |
|------|-------|---------|-----------|
| types/index.ts | 32 | Type definitions | Low |
| schemas/index.ts | 128 | Zod validation | Medium |
| services/employeeService.ts | 279 | CRUD + helpers | High |
| components/EmployeeTable.tsx | 112 | Data display | Low |
| components/EmployeeForm.tsx | 398 | Form creation/edit | High |
| components/EmployeeCard.tsx | 123 | Card display | Low |
| components/EmployeeFilters.tsx | 149 | Filter UI | Low |
| hooks/useEmployees.ts | 21 | Query hook | Low |
| hooks/useEmployee.ts | 21 | Query hook | Low |
| hooks/useCreateEmployee.ts | 34 | Mutation hook | Low |
| Total | ~1,100 | Complete feature | Medium |

---

## Validation Rules Summary

### Phone Number
- Pattern: `/^[0-9]{9,10}$/`
- Thai format (no country code)

### Salary
- Positive number
- Step: 0.01 (supports decimals)

### Email
- Must be valid email format

### Employee Code
- Non-empty string
- Must be unique
- Manual uniqueness check via `isEmployeeCodeExists()`

### Names
- Min 1 char, Max 100 chars
- Both English and Thai required

### Dates
- Form input: ISO string format (YYYY-MM-DD)
- Stored as: Date objects

### Status
- Enum: 'active' | 'on-leave' | 'resigned' | 'terminated'

---

## Performance Considerations

### Query Optimization
- TanStack Query with 5-min stale time reduces API calls
- Retry strategy: 2 attempts with exponential backoff
- List queries filtered before execution (Firestore)

### Search Limitation
- Client-side full-text search (scalability concern)
- Filters employees by 4 fields: name (EN & TH), email, code
- Note: For 1000+ employees, consider Algolia or Firebase Extension

### Potential Bottlenecks
- Fetching all employees for client-side search (no pagination)
- Photo URL external validation (I/O if validation added)
- No batch operations for bulk updates

---

## Security Considerations

### Current Implementation
- Uses Firebase Authentication for user accounts
- Firestore security rules (defined in firestore.rules)
- No role-based field access (RBAC in separate domain)

### Sensitive Fields
- Password: Only set during creation (never stored in employee doc)
- Email: Used for authentication
- Phone: No special handling

### Recommended for Extensions
- Salary field should have role-based access
- Social Security number needs encryption
- Leave records may need employee/manager privacy levels

---

## Testing Strategy Recommendations

### Unit Tests
- Zod schema validation
- Service method logic
- Query key generation

### Integration Tests
- Create → Update → Delete workflows
- Filter combinations
- Timestamp handling

### Component Tests
- Form submission
- Table pagination
- Filter interactions

### E2E Tests
- Employee CRUD flow
- Role-based access
- Multi-page navigation

---

## Future Improvements

1. **Centralize hardcoded data** → Config/DB tables
2. **Add employee code auto-generation** → Sequence-based
3. **Implement search optimization** → Algolia integration
4. **Add image upload** → Firebase Storage
5. **Phone international format** → libphonenumber
6. **Workflow validation** → Status transition rules
7. **Batch operations** → Bulk create/update/delete
8. **Audit trail** → Track all employee changes
9. **Export to PDF/Excel** → Report generation
10. **Integration with Payroll** → Automated payroll runs

---

## Key Files to Understand First

1. **types/index.ts** - Start here to understand data model
2. **schemas/index.ts** - See validation rules
3. **services/employeeService.ts** - Understand CRUD patterns
4. **hooks/useEmployees.ts** - See query hook pattern
5. **components/EmployeeForm.tsx** - Complex form example
6. **pages/EmployeeListPage.tsx** - See integration of everything

---

**Last Updated**: 2025-11-12  
**Architecture**: Domain-Driven Design (DDD)  
**Framework**: React + TypeScript + Firestore
