/**
 * Master Seed Script
 * Runs all seed scripts in the correct order
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface SeedStep {
  name: string;
  command: string;
  description: string;
}

const seedSteps: SeedStep[] = [
  // ============================================
  // Phase 1: RBAC & Permissions
  // ============================================
  {
    name: '1. Role Definitions',
    command: 'pnpm exec tsx src/seed/rbac/seedRoles.ts',
    description: 'Creating system roles (Admin, HR, Manager, Employee, Auditor)',
  },
  {
    name: '2. Permission Definitions',
    command: 'pnpm exec tsx src/seed/rbac/seedPermissions.ts',
    description: 'Creating resource permissions',
  },
  {
    name: '3. Role-Permission Assignments',
    command: 'pnpm exec tsx src/seed/rbac/seedRolePermissions.ts',
    description: 'Assigning permissions to roles',
  },
  {
    name: '3.1. Permission Definitions',
    command: 'pnpm exec tsx src/seed/rbac/seedPermissionDefinitions.ts',
    description: 'Creating detailed permission definitions (routes, actions, UI elements)',
  },
  {
    name: '3.2. Route Permissions',
    command: 'pnpm exec tsx src/seed/rbac/seedRoutePermissions.ts',
    description: 'Mapping routes to required permissions',
  },
  {
    name: '3.3. Action Permissions',
    command: 'pnpm exec tsx src/seed/rbac/seedActionPermissions.ts',
    description: 'Mapping actions to required permissions',
  },

  // ============================================
  // Phase 2: System Settings
  // ============================================
  {
    name: '4. Organizations',
    command: 'pnpm exec tsx src/seed/settings/seedOrganizations.ts',
    description: 'Creating organization/company information',
  },
  {
    name: '5. Locations',
    command: 'pnpm exec tsx src/seed/settings/seedLocations.ts',
    description: 'Creating office locations and branches with geofence',
  },

  // ============================================
  // Phase 3: Policies
  // ============================================
  {
    name: '6. Work Schedule Policies',
    command: 'pnpm exec tsx src/seed/policies/seedWorkSchedulePolicies.ts',
    description: 'Creating work schedule policies',
  },
  {
    name: '7. Overtime Policies',
    command: 'pnpm exec tsx src/seed/policies/seedOvertimePolicies.ts',
    description: 'Creating overtime policies',
  },
  {
    name: '8. Shifts',
    command: 'pnpm exec tsx src/seed/policies/seedShifts.ts',
    description: 'Creating shift definitions',
  },
  {
    name: '9. Penalty Policies',
    command: 'pnpm exec tsx src/seed/policies/seedPenaltyPolicies.ts',
    description: 'Creating penalty policies',
  },
  {
    name: '10. Public Holidays',
    command: 'pnpm exec tsx src/seed/policies/seedHolidays.ts',
    description: 'Creating public holidays for 2025',
  },

  // ============================================
  // Phase 4: Organizational Structure
  // ============================================
  {
    name: '11. Departments',
    command: 'pnpm exec tsx src/seed/people/seedDepartments.ts',
    description: 'Creating organizational departments',
  },
  {
    name: '12. Positions',
    command: 'pnpm exec tsx src/seed/people/seedPositions.ts',
    description: 'Creating job positions/titles',
  },

  // ============================================
  // Phase 5: People & Users
  // ============================================
  {
    name: '13. Employees',
    command: 'pnpm exec tsx src/seed/people/seedEmployees.ts',
    description: 'Creating employee records with full information',
  },
  {
    name: '14. Candidates',
    command: 'pnpm exec tsx src/seed/people/seedCandidates.ts',
    description: 'Creating candidate records for recruitment',
  },
  {
    name: '15. Test Users',
    command: 'pnpm exec tsx src/seed/users/seedAuthUsers.ts',
    description: 'Creating test users with different roles',
  },

  // ============================================
  // Phase 6: Leave Management
  // ============================================
  {
    name: '16. Leave Types',
    command: 'pnpm exec tsx src/seed/leave/seedLeaveTypes.ts',
    description: 'Creating leave types (annual, sick, personal, etc.)',
  },
  {
    name: '17. Leave Balances',
    command: 'pnpm exec tsx src/seed/leave/seedLeaveBalances.ts',
    description: 'Creating leave balance records for all employees',
  },
  {
    name: '18. Leave Requests',
    command: 'pnpm exec tsx src/seed/leave/seedLeaveRequests.ts',
    description: 'Creating sample leave requests (approved & pending)',
  },

  // ============================================
  // Phase 7: Attendance
  // ============================================
  {
    name: '19. Geofence Configs',
    command: 'pnpm exec tsx src/seed/attendance/seedGeofences.ts',
    description: 'Creating office geofence configurations',
  },
  {
    name: '20. Attendance Records',
    command: 'pnpm exec tsx src/seed/attendance/seedAttendanceRecords.ts',
    description: 'Creating sample attendance records with breaks and penalties',
  },

  // ============================================
  // Phase 8: Payroll
  // ============================================
  {
    name: '21. Payroll Records',
    command: 'pnpm exec tsx src/seed/payroll/seedPayrollRecords.ts',
    description: 'Creating payroll records for current and previous month',
  },
];

async function runSeedStep(step: SeedStep): Promise<boolean> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📦 ${step.name}`);
  console.log(`   ${step.description}`);
  console.log('='.repeat(80));

  try {
    const { stdout, stderr } = await execAsync(step.command, {
      cwd: process.cwd(),
    });

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    return true;
  } catch (error) {
    console.error(`❌ Error running ${step.name}:`, error);
    return false;
  }
}

async function seedAll() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                     🌱 HUMAN HR SYSTEM - SEED ALL DATA 🌱                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Check if emulator is running
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('⚠️  Setting up Firebase Emulator environment variables...');
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8888';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  }

  console.log(`✅ Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  console.log(`✅ Auth Emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);

  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  for (const step of seedSteps) {
    const success = await runSeedStep(step);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              📊 SEED SUMMARY                                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Successful: ${successCount}/${seedSteps.length}`);
  console.log(`❌ Failed: ${failCount}/${seedSteps.length}`);
  console.log(`⏱️  Duration: ${duration}s\n`);

  if (failCount > 0) {
    console.log('⚠️  Some seed operations failed. Please check the logs above.');
    process.exit(1);
  } else {
    console.log('🎉 All seed operations completed successfully!');
    console.log('\n📋 You can now login with these test accounts:');
    console.log('   • admin@human.com / admin123456');
    console.log('   • hr@human.com / hr123456');
    console.log('   • manager@human.com / manager123456');
    console.log('   • employee@human.com / employee123456');
    console.log('   • auditor@human.com / auditor123456\n');
    process.exit(0);
  }
}

// Run seed all
seedAll().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
