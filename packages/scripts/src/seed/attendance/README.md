# 🌱 Attendance Phase 2 - Seed Scripts

This directory contains seed scripts for testing the **Phase 2 Enhanced Attendance System** including:
- Geofence configurations (office locations)
- Sample attendance records with breaks, penalties, and location data

## 📁 Files Structure

```
attendance/
├── README.md                    # This file
├── index.ts                     # Run all attendance seeds
├── seedGeofences.ts            # Seed geofence configurations
└── seedAttendanceRecords.ts    # Seed sample attendance data
```

## 🚀 Quick Start

### Option 1: Run All Attendance Seeds

```bash
# From project root
pnpm tsx packages/scripts/src/seed/attendance/index.ts
```

### Option 2: Run Individual Seeds

```bash
# Geofences only
pnpm tsx packages/scripts/src/seed/attendance/seedGeofences.ts

# Attendance records only
pnpm tsx packages/scripts/src/seed/attendance/seedAttendanceRecords.ts
```

### Option 3: Run Full System Seed (includes everything)

```bash
# From project root
pnpm seed:run
```

## 📊 What Gets Seeded

### 1. Geofence Configurations (4 locations)

| ID | Name | Radius | Enforce Clock-In | Notes |
|----|------|--------|------------------|-------|
| `geofence-head-office` | สำนักงานใหญ่ | 500m | ✅ Yes | All departments |
| `geofence-branch-bkk` | สาขากรุงเทพฯ | 300m | ✅ Yes | Sales, Marketing only |
| `geofence-warehouse` | คลังสินค้า | 1000m | ✅ Yes | Logistics, Warehouse |
| `geofence-remote-work` | Remote Work | 50km | ❌ No | IT, Design |

**Location:** Bangkok, Thailand (example coordinates)

### 2. Attendance Records (6 sample records)

#### Record 1: Perfect Attendance (5 days ago)
- **User:** `user-emp-001`
- **Status:** ✅ Clocked out
- **On Time:** Yes (08:55)
- **Breaks:** 1 lunch (60 min)
- **Duration:** 8.08 hours
- **Penalties:** None

#### Record 2: Late Arrival (4 days ago)
- **User:** `user-emp-002`
- **Status:** ✅ Clocked out
- **Late:** 20 minutes
- **Breaks:** 1 lunch (60 min)
- **Duration:** 7.67 hours
- **Penalties:** 100 THB (late penalty)
- **Notes:** รถติด (traffic)

#### Record 3: Early Leave (3 days ago)
- **User:** `user-emp-003`
- **Status:** ✅ Clocked out
- **Early Leave:** 90 minutes
- **Breaks:** 1 lunch (60 min)
- **Duration:** 6.5 hours
- **Penalties:** 150 THB (early leave penalty)
- **Notes:** ไปรับลูกที่โรงเรียน (pick up kid)

#### Record 4: Multiple Breaks (2 days ago)
- **User:** `user-emp-001`
- **Status:** ✅ Clocked out
- **On Time:** Yes
- **Breaks:** 2 breaks (rest 15 min + lunch 60 min = 75 min total)
- **Duration:** 7.75 hours
- **Penalties:** None

#### Record 5: Remote Work (1 day ago)
- **User:** `user-emp-004`
- **Status:** ✅ Clocked out
- **Remote:** Yes (15km from office)
- **Breaks:** 1 lunch (60 min)
- **Duration:** 7.5 hours
- **Penalties:** None
- **Notes:** ทำงานจากบ้าน (work from home)

#### Record 6: Currently Working (today)
- **User:** `user-emp-001`
- **Status:** ⏰ Currently clocked in
- **Clock In:** 08:57
- **Breaks:** None yet
- **Duration:** In progress

## 🧪 Testing Scenarios

These seed records enable testing of:

### ✅ Basic Functionality
- [x] Clock in/out workflow
- [x] Real-time attendance status
- [x] Work duration calculation
- [x] Date filtering

### ✅ Break Management
- [x] Single break tracking
- [x] Multiple breaks per day
- [x] Paid vs unpaid breaks
- [x] Total break time calculation
- [x] Break duration deduction from work hours

### ✅ Late/Early Detection
- [x] Late arrival detection
- [x] Late penalty calculation
- [x] Early leave detection
- [x] Early leave penalty calculation
- [x] Grace period handling

### ✅ Geofencing
- [x] Location validation on clock-in
- [x] Distance from office calculation
- [x] Within/outside geofence status
- [x] Remote work scenarios
- [x] Department-specific geofences

### ✅ Penalty System
- [x] Automatic penalty application
- [x] Penalty amount calculation
- [x] Multiple penalty types
- [x] Approval workflow triggers

### ✅ Edge Cases
- [x] Currently clocked in (no clock-out yet)
- [x] Remote work (outside geofence)
- [x] Weekend/holiday handling (via date filtering)

## 📋 Data Validation

All seed data follows these principles:

1. **Type Safety:** All data matches TypeScript interfaces exactly
2. **Firestore Safe:** No `undefined` values, only `null` or omitted fields
3. **Schema Aligned:** Uses same structure as production schemas
4. **Realistic Data:** Dates, times, and locations are realistic for testing
5. **Edge Cases:** Includes edge cases for thorough testing

## 🔧 Customization

To modify seed data:

1. Edit the arrays in `seedGeofences.ts` or `seedAttendanceRecords.ts`
2. Follow the TypeScript interfaces for type safety
3. Ensure no `undefined` values (use `null` or omit)
4. Run the seed script to apply changes

Example:

```typescript
// Add new geofence
{
  id: 'geofence-new-branch',
  name: 'สาขาใหม่',
  latitude: 13.7000,
  longitude: 100.5000,
  radiusMeters: 400,
  isActive: true,
  enforceForClockIn: true,
  enforceForClockOut: false,
  allowedDepartments: [],
  allowedEmploymentTypes: [],
  createdBy: 'system',
}
```

## 🧹 Cleanup

To clear seed data from Firestore emulator:

```bash
# Stop emulator
# Delete data directory
# Restart emulator

firebase emulators:start --import=./emulator-data --export-on-exit
```

## 📝 Dependencies

These scripts depend on:
- Employees being seeded first (for `employeeId` references)
- Users being seeded first (for `userId` references)
- Penalty policies being seeded (for `policyId` references)

**Recommended order:**
1. Run full seed: `pnpm seed:run`
2. Or manually: Employees → Users → Penalty Policies → Geofences → Attendance

## 🔗 Related Documentation

- [Phase 2 Implementation Guide](../../../../../docs/ATTENDANCE_PHASE2_COMPLETE.md)
- [Phase 1 Documentation](../../../../../docs/ATTENDANCE_ENHANCED.md)
- [Seed Scripts Guide](../../../../../docs/standards/09-seed-scripts-and-emulator-guide.md)

## 🐛 Troubleshooting

### Issue: "User not found" errors

**Solution:** Ensure users are seeded first:
```bash
pnpm tsx packages/scripts/src/seed/users/seedAuthUsers.ts
```

### Issue: "Policy not found" errors

**Solution:** Ensure penalty policies are seeded first:
```bash
pnpm tsx packages/scripts/src/seed/policies/seedPenaltyPolicies.ts
```

### Issue: Firestore connection errors

**Solution:** Ensure emulator is running:
```bash
firebase emulators:start
```

And set environment variables:
```bash
export FIRESTORE_EMULATOR_HOST="localhost:8888"
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
```

## ✅ Verification

After seeding, verify in Firestore Emulator UI (http://localhost:4000):

1. **geofence_configs** collection should have 4 documents
2. **attendance** collection should have 6 documents
3. Check each document for:
   - No `undefined` values
   - Correct data types
   - Valid timestamps
   - Proper array structures

## 🎯 Next Steps

1. Run the seed scripts
2. Start the dev server: `pnpm dev`
3. Navigate to Attendance page
4. Test the Phase 2 features:
   - View attendance records with breaks
   - See penalties applied
   - Check location tracking
   - Test break management (if clocked in)

---

**Version:** 1.0.0
**Last Updated:** 2025-11-13
**Status:** ✅ Production Ready
