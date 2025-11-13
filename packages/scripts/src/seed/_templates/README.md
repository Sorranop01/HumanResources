# Seed Script Templates

This directory contains **template files** for creating new seed scripts with Zod validation in the Human HR Monorepo.

---

## 📋 Available Templates

### 1. `seedTemplate.ts` - Standard Seed Script Template
**Use for:** Creating new seed scripts with Zod validation

**Features:**
- ✅ Zod schema validation
- ✅ Batch write operations
- ✅ Error handling and reporting
- ✅ Optional data verification
- ✅ Denormalized fields support
- ✅ Comprehensive logging

---

## 🚀 How to Use Templates

### Step 1: Copy Template

```bash
# Copy template to your target directory
cp packages/scripts/src/seed/_templates/seedTemplate.ts \
   packages/scripts/src/seed/[domain]/seed[EntityName].ts

# Example: Creating a seed script for Leave Types
cp packages/scripts/src/seed/_templates/seedTemplate.ts \
   packages/scripts/src/seed/leave/seedLeaveTypes.ts
```

### Step 2: Customize Template

Open the copied file and update the following:

#### 2.1 Update Header Comments
```typescript
/**
 * Seed Leave Types  // ← Update collection name
 * Creates sample leave type records for development
 * ...
 */
```

#### 2.2 Update Imports
```typescript
// Replace with your actual schema
import { LeaveTypeSchema } from '@/domains/people/features/leave/schemas/leaveTypeSchema';
import type { LeaveType } from '@/domains/people/features/leave/types';
```

#### 2.3 Update Constants
```typescript
const COLLECTION_NAME = 'leaveTypes'; // ← Update collection name
const TENANT_ID = 'default';
```

#### 2.4 Add Reference Data (if needed)
```typescript
// Example for denormalized fields
const DEPARTMENT_MAP: Record<string, { name: string; code: string }> = {
  'dept-hr': { name: 'Human Resources', code: 'HR' },
};
```

#### 2.5 Add Seed Data
```typescript
const seedData: Omit<LeaveType, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'leave-annual',
    code: 'ANNUAL',
    name: 'ลาพักผ่อนประจำปี',
    nameEn: 'Annual Leave',
    category: 'paid',
    isPaid: true,
    defaultDaysPerYear: 10,
    // ... add all required fields
    tenantId: 'default',
  },
  // Add more leave types...
];
```

#### 2.6 Update Validation Function
```typescript
function validateEntity(data: unknown, context?: string): LeaveType {
  try {
    return LeaveTypeSchema.parse(data); // ← Use your schema
  } catch (error) {
    // Error handling stays the same
  }
}
```

#### 2.7 Update Function Names
```typescript
// Replace 'MyEntities' with your entity name
export async function seedLeaveTypes() {  // ← Update function name
  console.log('🌱 Seeding leaveTypes...');  // ← Update log
  // ... rest of the function
}
```

### Step 3: Test Your Seed Script

```bash
# Run your new seed script
pnpm tsx packages/scripts/src/seed/leave/seedLeaveTypes.ts

# Run with verification
pnpm tsx packages/scripts/src/seed/leave/seedLeaveTypes.ts --verify
```

### Step 4: Add to seedAll.ts

Update `packages/scripts/src/seed/seedAll.ts`:

```typescript
import { seedLeaveTypes } from './leave/seedLeaveTypes.js';

async function main() {
  // ... other seeds

  // Phase 6: Leave Management
  await seedLeaveTypes();

  // ... rest of seeds
}
```

---

## 📝 Template Checklist

When using the template, make sure to:

- [ ] Update header comments with collection name
- [ ] Import correct Zod schema from domain layer
- [ ] Import correct TypeScript types
- [ ] Update `COLLECTION_NAME` constant
- [ ] Add reference data if using denormalized fields
- [ ] Add complete seed data array
- [ ] Update `validateEntity()` function signature
- [ ] Update function names (seedMyEntities → seed[YourEntity])
- [ ] Test with emulator before committing
- [ ] Run verification to check for undefined values
- [ ] Add to `seedAll.ts` orchestrator

---

## 🎯 Quick Reference: Common Tasks

### Adding Denormalized Fields

```typescript
// 1. Define reference map
const DEPARTMENT_MAP = {
  'dept-hr': { name: 'Human Resources', code: 'HR' },
};

// 2. Create enrichment function
function enrichEmployeeData(employee: BaseEmployee): CompleteEmployee {
  const dept = DEPARTMENT_MAP[employee.departmentId];
  return {
    ...employee,
    departmentName: dept.name,
    departmentCode: dept.code,
  };
}

// 3. Use in seed loop
const enriched = enrichEmployeeData(data);
const validated = EmployeeSchema.parse(stripUndefined(enriched));
```

### Handling Timestamps

```typescript
import { Timestamp } from 'firebase-admin/firestore';

const now = Timestamp.now();

const entity = {
  ...data,
  createdAt: now,
  updatedAt: now,
};
```

### Error Handling

The template includes comprehensive error handling:
- ✅ Validation errors are logged with context
- ✅ Write errors are caught separately
- ✅ Detailed error report at the end
- ✅ Non-zero exit code on errors

---

## 🧪 Testing Guidelines

### 1. Test with Emulator

```bash
# Start emulator
pnpm dev:emulators

# In another terminal, run seed
pnpm tsx packages/scripts/src/seed/[domain]/seed[Entity].ts
```

### 2. Verify Data in Emulator UI

Open: http://localhost:4000/firestore

Check:
- ✅ Document count matches expected
- ✅ No undefined values
- ✅ All required fields present
- ✅ Denormalized fields are correct

### 3. Run Verification Script

```bash
pnpm tsx packages/scripts/src/seed/[domain]/seed[Entity].ts --verify
```

---

## 📚 Related Documentation

- **Implementation Plan**: `/docs/ZOD_VALIDATION_SEED_SCRIPTS_PLAN.md`
- **Zod Patterns**: `/docs/SEED_SCRIPT_ZOD_PATTERNS.md`
- **Seed Scripts Guide**: `/docs/standards/09-seed-scripts-and-emulator-guide.md`
- **Zod Schema Standards**: `/docs/standards/10-Single-Source-of-Truth-Zod.md`

---

## 💡 Tips

1. **Start Simple**: Begin with a minimal seed data set, then expand
2. **Test Early**: Run your seed script after each major change
3. **Use Verification**: Always run with `--verify` flag to catch issues
4. **Check Logs**: Read error messages carefully - Zod provides detailed feedback
5. **Match Schema**: Ensure your seed data matches the Zod schema exactly

---

## 🆘 Troubleshooting

### Problem: "Cannot find module '@/domains/...'"

**Solution**: Check your tsconfig paths and ensure the import alias is correct.

### Problem: "Validation failed: undefined is not allowed"

**Solution**: Use `stripUndefined()` before validation:
```typescript
const validated = MySchema.parse(stripUndefined(data));
```

### Problem: "Document count mismatch"

**Solution**: Check for validation errors in the output. Some entities may have failed validation.

### Problem: "Schema validation failed"

**Solution**: Compare your seed data structure with the Zod schema. Ensure all required fields are present.

---

## 🤝 Contributing

When adding new templates or improving existing ones:

1. Update this README
2. Add examples to `/docs/SEED_SCRIPT_ZOD_PATTERNS.md`
3. Test with multiple scenarios
4. Document any new patterns or techniques

---

**Last Updated:** 2025-11-13
**Maintained By:** Human HR Development Team
