# Option A: Policies Collections Implementation Plan

**Date**: 2025-11-14
**Status**: 🔄 **IN PROGRESS** (1/5 policies complete)
**Goal**: Complete all 5 Policy collections to achieve 100% coverage

---

## 📊 Progress Overview

| Collection | Schema | Layer 1 | Layer 2 | Layer 3 | Layer 4 | Status |
|------------|--------|---------|---------|---------|---------|--------|
| **Holidays** | ✅ | ✅ | ✅ | ✅ | ✅ | **COMPLETE** |
| **Shifts** | ✅ | ⏳ | ⏳ | 🟡 (partial) | ⏳ | In Progress |
| **Work Schedule Policies** | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | Pending |
| **Overtime Policies** | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | Pending |
| **Penalty Policies** | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | Pending |

**Note**: All schemas already exist! Only need to implement Layers 2-4.

---

## ✅ Completed: Holidays Collection

### Layer 1: Schema (Already Existed)
- ✅ `PublicHolidaySchema` - Complete Firestore schema
- ✅ `CreatePublicHolidaySchema` - Create input
- ✅ `UpdatePublicHolidaySchema` - Update input
- ✅ `CloudFunctionCreateHolidaySchema` - Cloud Function create
- ✅ `CloudFunctionUpdateHolidaySchema` - Cloud Function update
- ✅ `CloudFunctionDeleteHolidaySchema` - Cloud Function delete

### Layer 2: Service Layer
- ✅ Added `convertTimestamps()` helper function
- ✅ Added `docToPublicHoliday()` with Zod validation
- ✅ Updated all query methods to filter null results
- ✅ Fixed all `Timestamp` references to `FirestoreTimestamp`

### Layer 3: Cloud Functions
- ✅ `createHoliday.ts` (116 lines) - Create with duplicate check
- ✅ `updateHoliday.ts` (115 lines) - Update with conflict check
- ✅ `deleteHoliday.ts` (87 lines) - Delete (admin only)
- ✅ `index.ts` - Export all functions

**Features**:
- Duplicate date check (same tenant, same date)
- HR and Admin permissions
- Date conflict validation on update
- Admin-only delete

### Layer 4: Firestore Rules
- ✅ 96 lines of validation rules
- ✅ `isValidHolidayData()` - Create validation
- ✅ `isValidHolidayUpdate()` - Update validation
- ✅ Permissions: HR can create/update, Admin can delete

### Layer 5: TypeScript Types
- ✅ All types inferred from Zod schemas

### Files Created/Modified
- Enhanced: `holidaySchema.ts` (+23 lines)
- Modified: `holidayService.ts` (~100 lines changed)
- Created: `functions/src/api/holidays/createHoliday.ts` (116 lines)
- Created: `functions/src/api/holidays/updateHoliday.ts` (115 lines)
- Created: `functions/src/api/holidays/deleteHoliday.ts` (87 lines)
- Created: `functions/src/api/holidays/index.ts` (7 lines)
- Modified: `functions/src/index.ts` (+2 lines)
- Modified: `firestore.rules` (+96 lines)

**Total**: ~544 lines added/modified

---

## 🔄 In Progress: Shifts Collection

### Completed So Far
- ✅ Schema enhancement with Cloud Function schemas (+23 lines)
- ✅ Created `functions/src/api/shifts/index.ts`
- ⏳ Need to complete Layer 2, 3, 4

### Remaining Work
1. **Layer 2**: Service Layer
   - Update `shiftService.ts` with validation pattern
   - Add `convertTimestamps()` and `docToShift()`
   - Fix all queries to filter nulls

2. **Layer 3**: Cloud Functions
   - `createShift.ts` - Code duplicate check
   - `updateShift.ts` - Code conflict check
   - `deleteShift.ts` - Check for employee assignments before delete

3. **Layer 4**: Firestore Rules
   - Add validation rules (~100 lines estimated)
   - Validate time format (HH:mm)
   - Validate working days array
   - Validate color hex code

**Estimated**: ~600 lines total

---

## ⏳ Pending: Work Schedule Policies Collection

### What Exists
- ✅ Complete schemas in `workSchedulePolicySchema.ts`
- ✅ Service layer in `workSchedulePolicyService.ts`
- ✅ Types in `types/workSchedulePolicy.ts`

### What Needs to Be Done
1. **Layer 1**: Add Cloud Function schemas (+20 lines)
2. **Layer 2**: Add validation to service layer (~80 lines)
3. **Layer 3**: Create 3 Cloud Functions (~400 lines)
4. **Layer 4**: Add Firestore Rules (~100 lines)

**Estimated**: ~600 lines total

---

## ⏳ Pending: Overtime Policies Collection

### What Exists
- ✅ Complete schemas in `overtimePolicySchema.ts`
- ✅ Service layer in `overtimePolicyService.ts`
- ✅ Types in `types/overtimePolicy.ts`

### What Needs to Be Done
1. **Layer 1**: Add Cloud Function schemas (+20 lines)
2. **Layer 2**: Add validation to service layer (~80 lines)
3. **Layer 3**: Create 3 Cloud Functions (~400 lines)
4. **Layer 4**: Add Firestore Rules (~100 lines)

**Estimated**: ~600 lines total

---

## ⏳ Pending: Penalty Policies Collection

### What Exists
- ✅ Complete schemas in `penaltyPolicySchema.ts`
- ✅ Service layer in `penaltyPolicyService.ts`
- ✅ Types in `types/penaltyPolicy.ts`

### What Needs to Be Done
1. **Layer 1**: Add Cloud Function schemas (+20 lines)
2. **Layer 2**: Add validation to service layer (~80 lines)
3. **Layer 3**: Create 3 Cloud Functions (~400 lines)
4. **Layer 4**: Add Firestore Rules (~100 lines)

**Estimated**: ~600 lines total

---

## 📈 Overall Metrics

### Completed So Far (Holidays Only)
- **Lines Added/Modified**: ~544 lines
- **Cloud Functions**: 3 functions
- **Firestore Rules**: 96 lines
- **Code Reduction**: ~55% (estimated)

### Total Estimated for All 5 Policies
- **Total Lines**: ~3,000 lines (544 done + ~2,456 remaining)
- **Total Cloud Functions**: 15 functions (3 per collection)
- **Total Firestore Rules**: ~480 lines
- **Collections**: 5 collections

### Breakdown by Collection
| Collection | Lines | Functions | Rules | Complexity |
|------------|-------|-----------|-------|------------|
| Holidays | ~544 | 3 | 96 | Medium |
| Shifts | ~600 | 3 | ~100 | Medium-High |
| Work Schedule | ~600 | 3 | ~100 | Medium |
| Overtime | ~600 | 3 | ~100 | Medium |
| Penalty | ~600 | 3 | ~100 | Medium |
| **Total** | **~3,000** | **15** | **~480** | - |

---

## 🎯 Implementation Strategy

### Recommended Approach

Given that:
1. All schemas already exist ✅
2. All service layers already exist ✅
3. All types already exist ✅
4. Patterns are identical across collections

**Fastest approach**: Implement in parallel for all 4 remaining collections

### Template Pattern

Each collection follows this exact pattern:

#### 1. Schema Enhancement (+20 lines)
```typescript
export const CloudFunctionCreate{Entity}Schema = z.object({
  {entity}Data: Create{Entity}Schema.extend({
    tenantId: z.string().min(1, 'ต้องระบุ Tenant ID'),
  }),
});

export const CloudFunctionUpdate{Entity}Schema = z.object({
  {entity}Id: z.string().min(1, 'ต้องระบุ {Entity} ID'),
  {entity}Data: Update{Entity}Schema,
});

export const CloudFunctionDelete{Entity}Schema = z.object({
  {entity}Id: z.string().min(1, 'ต้องระบุ {Entity} ID'),
});
```

#### 2. Service Layer Validation (~80 lines)
```typescript
function convertTimestamps(data: unknown): unknown { /* ... */ }

function docTo{Entity}(id: string, data: any): {Entity} | null {
  const converted = { id, ...(convertTimestamps(data) as Record<string, unknown>) };
  const validation = {Entity}Schema.safeParse(converted);
  if (!validation.success) {
    console.warn(`⚠️ Skipping invalid {entity} ${id}`);
    return null;
  }
  return validation.data;
}

// Update all queries:
.map((doc) => docTo{Entity}(doc.id, doc.data()))
.filter((e): e is {Entity} => e !== null)
```

#### 3. Cloud Functions (~400 lines)
- `create{Entity}.ts` (~130 lines)
- `update{Entity}.ts` (~130 lines)
- `delete{Entity}.ts` (~100 lines)
- `index.ts` (~7 lines)

#### 4. Firestore Rules (~100 lines)
- `isValid{Entity}Data()` function
- `isValid{Entity}Update()` function
- CRUD permissions

---

## 🚀 Next Steps

### Option A: Sequential Implementation (Slower, More Thorough)
1. Complete Shifts (3-4 hours)
2. Complete Work Schedule Policies (3-4 hours)
3. Complete Overtime Policies (3-4 hours)
4. Complete Penalty Policies (3-4 hours)

**Total Time**: 12-16 hours

### Option B: Parallel Template (Faster, Recommended)
1. Create all Cloud Function schemas in parallel (30 min)
2. Update all service layers in parallel (1 hour)
3. Create all Cloud Functions using template (2-3 hours)
4. Create all Firestore Rules using template (1-2 hours)

**Total Time**: 4-6 hours

---

## 💡 Decision Point

**Question for User**:

เนื่องจากเหลือ collections อีก 4 ตัวที่มี pattern เหมือนกันทุกประการ คุณต้องการให้:

**A) ทำทีละ collection แบบละเอียด** (ช้าแต่ละเอียด, 12-16 ชั่วโมง)

หรือ

**B) ทำแบบ batch พร้อมกัน 4 collections** (เร็วแต่ใช้ template, 4-6 ชั่วโมง)

ทั้งสองวิธีได้ผลลัพธ์เหมือนกัน แต่วิธี B จะเร็วกว่ามาก

---

*Created*: 2025-11-14
*Collection Progress*: 1/5 Policies Complete (Holidays ✅)
*Overall Progress*: 7/12 Collections (58% → targeting 100%)
