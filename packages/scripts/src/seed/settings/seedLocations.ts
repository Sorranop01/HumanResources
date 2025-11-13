/**
 * Seed Locations
 * Creates office locations and branches with geofence data
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 */

import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface LocationAddress {
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
}

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

type LocationType =
  | 'headquarters'
  | 'branch'
  | 'warehouse'
  | 'remote'
  | 'coworking'
  | 'client-site';

interface Location {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  type: LocationType;
  address: LocationAddress;
  coordinates?: LocationCoordinates;
  geofenceRadius?: number;
  timezone: string;
  phone?: string;
  email?: string;
  capacity?: number;
  currentEmployeeCount?: number;
  isActive: boolean;
  supportsRemoteWork: boolean;
  tenantId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

const locations: Omit<Location, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'loc-hq-bangkok',
    code: 'HQ-BKK',
    name: 'สำนักงานใหญ่ กรุงเทพฯ',
    nameEn: 'Headquarters Bangkok',
    type: 'headquarters',
    address: {
      addressLine1: '999 อาคารเอ็มไพร์ทาวเวอร์ ชั้น 42',
      addressLine2: 'ถนนสาทรใต้',
      subDistrict: 'ยานนาวา',
      district: 'สาทร',
      province: 'กรุงเทพมหานคร',
      postalCode: '10120',
      country: 'Thailand',
    },
    coordinates: {
      latitude: 13.7245,
      longitude: 100.5282,
    },
    geofenceRadius: 200,
    timezone: 'Asia/Bangkok',
    phone: '+6621234567',
    email: 'bangkok@human.co.th',
    capacity: 200,
    currentEmployeeCount: 0,
    isActive: true,
    supportsRemoteWork: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'loc-branch-chiang-mai',
    code: 'BR-CNX',
    name: 'สาขาเชียงใหม่',
    nameEn: 'Chiang Mai Branch',
    type: 'branch',
    address: {
      addressLine1: '88/8 ถนนห้วยแก้ว',
      subDistrict: 'สุเทพ',
      district: 'เมืองเชียงใหม่',
      province: 'เชียงใหม่',
      postalCode: '50200',
      country: 'Thailand',
    },
    coordinates: {
      latitude: 18.7883,
      longitude: 98.9853,
    },
    geofenceRadius: 150,
    timezone: 'Asia/Bangkok',
    phone: '+6653123456',
    email: 'chiangmai@human.co.th',
    capacity: 50,
    currentEmployeeCount: 0,
    isActive: true,
    supportsRemoteWork: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'loc-branch-phuket',
    code: 'BR-HKT',
    name: 'สาขาภูเก็ต',
    nameEn: 'Phuket Branch',
    type: 'branch',
    address: {
      addressLine1: '123/45 ถนนภูเก็ต',
      subDistrict: 'ตลาดใหญ่',
      district: 'เมืองภูเก็ต',
      province: 'ภูเก็ต',
      postalCode: '83000',
      country: 'Thailand',
    },
    coordinates: {
      latitude: 7.8804,
      longitude: 98.3923,
    },
    geofenceRadius: 100,
    timezone: 'Asia/Bangkok',
    phone: '+6676123456',
    email: 'phuket@human.co.th',
    capacity: 30,
    currentEmployeeCount: 0,
    isActive: true,
    supportsRemoteWork: false,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'loc-warehouse-samut-prakan',
    code: 'WH-SPK',
    name: 'คลังสินค้า สมุทรปราการ',
    nameEn: 'Warehouse Samut Prakan',
    type: 'warehouse',
    address: {
      addressLine1: '456 นิคมอุตสาหกรรมบางปู',
      subDistrict: 'แพรกษา',
      district: 'เมืองสมุทรปราการ',
      province: 'สมุทรปราการ',
      postalCode: '10280',
      country: 'Thailand',
    },
    coordinates: {
      latitude: 13.5502,
      longitude: 100.6667,
    },
    geofenceRadius: 300,
    timezone: 'Asia/Bangkok',
    phone: '+6627123456',
    email: 'warehouse@human.co.th',
    capacity: 20,
    currentEmployeeCount: 0,
    isActive: true,
    supportsRemoteWork: false,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'loc-coworking-silom',
    code: 'CO-SLM',
    name: 'Co-working Space สีลม',
    nameEn: 'Co-working Space Silom',
    type: 'coworking',
    address: {
      addressLine1: '234 ถนนสีลม',
      subDistrict: 'สีลม',
      district: 'บางรัก',
      province: 'กรุงเทพมหานคร',
      postalCode: '10500',
      country: 'Thailand',
    },
    coordinates: {
      latitude: 13.7278,
      longitude: 100.534,
    },
    geofenceRadius: 50,
    timezone: 'Asia/Bangkok',
    phone: '+6626543210',
    email: 'silom@human.co.th',
    capacity: 15,
    currentEmployeeCount: 0,
    isActive: true,
    supportsRemoteWork: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'loc-remote',
    code: 'REMOTE',
    name: 'ทำงานจากที่บ้าน',
    nameEn: 'Remote Work',
    type: 'remote',
    address: {
      addressLine1: 'N/A',
      subDistrict: 'N/A',
      district: 'N/A',
      province: 'N/A',
      postalCode: '00000',
      country: 'Thailand',
    },
    timezone: 'Asia/Bangkok',
    isActive: true,
    supportsRemoteWork: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

async function seedLocations() {
  console.log('🌱 Seeding Locations...');

  const now = Timestamp.now();
  const batch = db.batch();

  for (const location of locations) {
    const docRef = db.collection('locations').doc(location.id);

    // ✅ Use stripUndefined for Firestore safety
    const locationPayload = stripUndefined({
      ...location,
      createdAt: now,
      updatedAt: now,
    });

    batch.set(docRef, locationPayload);
    console.log(`  ✅ Created location: ${location.name} (${location.code})`);
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${locations.length} locations\n`);
}

// Run seed
seedLocations()
  .then(() => {
    console.log('✅ Location seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding locations:', error);
    process.exit(1);
  });
