/**
 * Seed Geofence Configurations
 * Creates default office location geofences for attendance validation
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 */

import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface GeofenceConfig {
  id: string;
  name: string;
  description?: string;

  // Location
  latitude: number;
  longitude: number;
  radiusMeters: number;

  // Address
  address?: string;

  // Validation settings
  isActive: boolean;
  enforceForClockIn: boolean;
  enforceForClockOut: boolean;
  allowedDepartments?: string[];
  allowedEmploymentTypes?: string[];

  // Metadata
  createdBy: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedBy?: string;
  updatedAt?: FirebaseFirestore.Timestamp;
}

const geofenceConfigs: Omit<GeofenceConfig, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'geofence-head-office',
    name: 'สำนักงานใหญ่',
    description: 'พื้นที่ลงเวลาสำหรับสำนักงานใหญ่',
    latitude: 13.7563, // Bangkok coordinates (example)
    longitude: 100.5018,
    radiusMeters: 500, // 500 meters radius
    address: '999 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310',
    isActive: true,
    enforceForClockIn: true,
    enforceForClockOut: false, // Allow clock-out from anywhere
    allowedDepartments: [], // All departments
    allowedEmploymentTypes: [], // All employment types
    createdBy: 'system',
  },
  {
    id: 'geofence-branch-bkk',
    name: 'สาขากรุงเทพฯ',
    description: 'พื้นที่ลงเวลาสำหรับสาขากรุงเทพฯ',
    latitude: 13.7245,
    longitude: 100.493,
    radiusMeters: 300,
    address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
    isActive: true,
    enforceForClockIn: true,
    enforceForClockOut: false,
    allowedDepartments: ['dept-sales', 'dept-marketing'],
    allowedEmploymentTypes: [],
    createdBy: 'system',
  },
  {
    id: 'geofence-warehouse',
    name: 'คลังสินค้า',
    description: 'พื้นที่ลงเวลาสำหรับคลังสินค้า',
    latitude: 13.6904,
    longitude: 100.7502,
    radiusMeters: 1000, // Larger radius for warehouse area
    address: '456 ถนนบางนา-ตราด กม.10 แขวงบางนา เขตบางนา กรุงเทพมหานคร 10260',
    isActive: true,
    enforceForClockIn: true,
    enforceForClockOut: true, // Strict for warehouse
    allowedDepartments: ['dept-logistics', 'dept-warehouse'],
    allowedEmploymentTypes: ['full-time', 'contract'],
    createdBy: 'system',
  },
  {
    id: 'geofence-remote-work',
    name: 'ทำงานจากที่ไหนก็ได้ (Remote)',
    description: 'สำหรับพนักงานที่ทำงานจากที่ไหนก็ได้',
    latitude: 13.7563,
    longitude: 100.5018,
    radiusMeters: 50000, // 50 km - very large radius
    address: 'ทำงานจากระยะไกล',
    isActive: true,
    enforceForClockIn: false, // No enforcement for remote
    enforceForClockOut: false,
    allowedDepartments: ['dept-it', 'dept-design'],
    allowedEmploymentTypes: ['full-time'],
    createdBy: 'system',
  },
];

export async function seedGeofences() {
  console.log('🌍 Seeding geofence configurations...');

  const batch = db.batch();
  const now = Timestamp.now();

  for (const config of geofenceConfigs) {
    const docRef = db.collection('geofence_configs').doc(config.id);

          // ✅ Use stripUndefined for Firestore safety
          const geofencePayload = stripUndefined({
            ...config,
            createdAt: now,
            updatedAt: now,
          });
    batch.set(docRef, geofencePayload);
    console.log(`  ✓ Created geofence: ${config.name}`);
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${geofenceConfigs.length} geofence configurations`);
}

// Run seed
seedGeofences()
  .then(() => {
    console.log('✅ Geofence seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding geofences:', error);
    process.exit(1);
  });
