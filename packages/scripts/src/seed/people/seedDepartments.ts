/**
 * Seed Departments
 * Creates organizational departments structure
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 * ✅ Uses Zod validation for data integrity
 */

import { validateDepartment } from '@/domains/system/features/settings/departments/schemas/departmentSchemas';
import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface Department {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  description: string;
  parentDepartment?: string;
  managerId?: string;
  managerName?: string;
  headCount: number;
  isActive: boolean;
  tenantId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

const departments: Omit<Department, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'dept-executive',
    code: 'EXEC',
    name: 'ฝ่ายบริหาร',
    nameEn: 'Executive',
    description: 'ผู้บริหารระดับสูง CEO, CFO, CTO',
    headCount: 0,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'dept-hr',
    code: 'HR',
    name: 'ฝ่ายทรัพยากรบุคคล',
    nameEn: 'Human Resources',
    description: 'จัดการบุคลากร สรรหา อบรม และพัฒนาพนักงาน',
    headCount: 0,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'dept-finance',
    code: 'FIN',
    name: 'ฝ่ายการเงินและบัญชี',
    nameEn: 'Finance & Accounting',
    description: 'จัดการด้านการเงิน บัญชี และการชำระเงิน',
    headCount: 0,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'dept-it',
    code: 'IT',
    name: 'ฝ่ายเทคโนโลยีสารสนเทศ',
    nameEn: 'Information Technology',
    description: 'พัฒนาซอฟต์แวร์ ดูแลระบบ และโครงสร้างพื้นฐานด้าน IT',
    headCount: 0,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'dept-it-dev',
    code: 'IT-DEV',
    name: 'ทีมพัฒนาซอฟต์แวร์',
    nameEn: 'Software Development',
    description: 'พัฒนาและดูแลระบบซอฟต์แวร์',
    parentDepartment: 'dept-it',
    headCount: 0,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'dept-it-infra',
    code: 'IT-INFRA',
    name: 'ทีมโครงสร้างพื้นฐาน',
    nameEn: 'Infrastructure',
    description: 'ดูแลเซิร์ฟเวอร์ เครือข่าย และระบบคลาวด์',
    parentDepartment: 'dept-it',
    headCount: 0,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'dept-marketing',
    code: 'MKT',
    name: 'ฝ่ายการตลาด',
    nameEn: 'Marketing',
    description: 'วางแผนและดำเนินการด้านการตลาด โฆษณา และประชาสัมพันธ์',
    headCount: 0,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'dept-sales',
    code: 'SALES',
    name: 'ฝ่ายขาย',
    nameEn: 'Sales',
    description: 'ขายสินค้าและบริการ ดูแลลูกค้า',
    headCount: 0,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'dept-cs',
    code: 'CS',
    name: 'ฝ่ายบริการลูกค้า',
    nameEn: 'Customer Service',
    description: 'ดูแลและแก้ไขปัญหาลูกค้า',
    headCount: 0,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'dept-operations',
    code: 'OPS',
    name: 'ฝ่ายปฏิบัติการ',
    nameEn: 'Operations',
    description: 'บริหารจัดการการดำเนินงานประจำวัน',
    headCount: 0,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'dept-admin',
    code: 'ADMIN',
    name: 'ฝ่ายธุรการ',
    nameEn: 'Administration',
    description: 'งานธุรการทั่วไป จัดซื้อ อาคารสถานที่',
    headCount: 0,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

/**
 * Validate department data with Zod
 */
function validateDepartmentData(data: unknown, context: string) {
  try {
    return validateDepartment(data);
  } catch (error) {
    console.error(`❌ Validation failed for ${context}:`, error);
    throw error;
  }
}

async function seedDepartments() {
  console.log('🌱 Seeding Departments...');

  const now = Timestamp.now();
  const batch = db.batch();

  for (const dept of departments) {
    const docRef = db.collection('departments').doc(dept.id);

    // ✅ Use stripUndefined for Firestore safety
    const departmentPayload = stripUndefined({
      ...dept,
      createdAt: now,
      updatedAt: now,
      tenantId: 'default', // ✅ Ensure tenantId is present
    });

    // ✅ Validate with Zod before writing
    const validated = validateDepartmentData(departmentPayload, `${dept.name} (${dept.code})`);

    batch.set(docRef, validated);
    console.log(`  ✅ Created department: ${dept.name} (${dept.code})`);
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${departments.length} departments\n`);
}

// Run seed
seedDepartments()
  .then(() => {
    console.log('✅ Department seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding departments:', error);
    process.exit(1);
  });
