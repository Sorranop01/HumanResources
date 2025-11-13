/**
 * Attendance Seed Scripts - Index
 * Run all attendance-related seed scripts
 */

import { seedAttendanceRecords } from './seedAttendanceRecords.js';
import { seedGeofences } from './seedGeofences.js';

export async function seedAttendanceAll() {
  console.log('🚀 Starting Attendance Phase 2 seed process...\n');

  try {
    // 1. Seed geofence configurations first
    await seedGeofences();
    console.log('');

    // 2. Seed attendance records (depends on geofences)
    await seedAttendanceRecords();
    console.log('');

    console.log('✅ All attendance seed scripts completed successfully!');
  } catch (error) {
    console.error('❌ Attendance seed process failed:', error);
    throw error;
  }
}

// Run directly if this file is executed
if (require.main === module) {
  seedAttendanceAll()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed:', error);
      process.exit(1);
    });
}
