/**
 * Seed Organizations
 * Creates sample organization/company data
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 */

import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface OrganizationAddress {
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
}

interface Organization {
  id: string;
  companyName: string;
  companyNameEn: string;
  registrationNumber: string;
  taxNumber: string;
  address: OrganizationAddress;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  currency: string;
  fiscalYearStart: string;
  timezone: string;
  defaultLanguage: 'th' | 'en';
  isActive: boolean;
  tenantId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

const organizations: Omit<Organization, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'org-human-demo',
    companyName: 'บริษัท ฮิวแมน เทคโนโลยี จำกัด',
    companyNameEn: 'Human Technology Co., Ltd.',
    registrationNumber: '0105563012345',
    taxNumber: '0105563012345',
    address: {
      addressLine1: '999 อาคารเอ็มไพร์ทาวเวอร์ ชั้น 42',
      addressLine2: 'ถนนสาทรใต้',
      subDistrict: 'ยานนาวา',
      district: 'สาทร',
      province: 'กรุงเทพมหานคร',
      postalCode: '10120',
      country: 'Thailand',
    },
    phone: '+6621234567',
    email: 'info@human.co.th',
    website: 'https://www.human.co.th',
    logoUrl: 'https://via.placeholder.com/200x200?text=HUMAN',
    primaryColor: '#2563EB',
    secondaryColor: '#10B981',
    currency: 'THB',
    fiscalYearStart: '01-01',
    timezone: 'Asia/Bangkok',
    defaultLanguage: 'th',
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'org-branch-chiang-mai',
    companyName: 'บริษัท ฮิวแมน เทคโนโลยี (สาขาเชียงใหม่)',
    companyNameEn: 'Human Technology Co., Ltd. (Chiang Mai Branch)',
    registrationNumber: '0105563012345',
    taxNumber: '0105563012345',
    address: {
      addressLine1: '88/8 ถนนห้วยแก้ว',
      subDistrict: 'สุเทพ',
      district: 'เมืองเชียงใหม่',
      province: 'เชียงใหม่',
      postalCode: '50200',
      country: 'Thailand',
    },
    phone: '+6653123456',
    email: 'chiangmai@human.co.th',
    website: 'https://www.human.co.th',
    logoUrl: 'https://via.placeholder.com/200x200?text=HUMAN',
    primaryColor: '#2563EB',
    secondaryColor: '#10B981',
    currency: 'THB',
    fiscalYearStart: '01-01',
    timezone: 'Asia/Bangkok',
    defaultLanguage: 'th',
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

async function seedOrganizations() {
  console.log('🌱 Seeding Organizations...');

  const now = Timestamp.now();
  const batch = db.batch();

  for (const org of organizations) {
    const docRef = db.collection('organizations').doc(org.id);

    // ✅ Use stripUndefined for Firestore safety
    const orgPayload = stripUndefined({
      ...org,
      createdAt: now,
      updatedAt: now,
    });

    batch.set(docRef, orgPayload);
    console.log(`  ✅ Created organization: ${org.companyName}`);
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${organizations.length} organizations\n`);
}

// Run seed
seedOrganizations()
  .then(() => {
    console.log('✅ Organization seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding organizations:', error);
    process.exit(1);
  });
