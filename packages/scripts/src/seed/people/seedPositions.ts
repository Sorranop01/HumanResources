/**
 * Seed Positions
 * Creates job positions/titles
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 * ✅ Uses Zod validation for data integrity
 */

import { validatePosition } from '@/domains/system/features/settings/positions/schemas/positionSchemas';
import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface Position {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  description: string;
  department: string;
  level: string; // Entry, Junior, Mid, Senior, Lead, Manager, Director, VP, C-Level
  minSalary: number;
  maxSalary: number;
  isActive: boolean;
  tenantId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

const positions: Omit<Position, 'createdAt' | 'updatedAt'>[] = [
  // ============================================
  // Executive Level
  // ============================================
  {
    id: 'pos-ceo',
    code: 'CEO',
    name: 'ประธานเจ้าหน้าที่บริหาร',
    nameEn: 'Chief Executive Officer',
    description: 'ผู้บริหารสูงสุดขององค์กร',
    department: 'ฝ่ายบริหาร',
    level: 'C-Level',
    minSalary: 200000,
    maxSalary: 500000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-cto',
    code: 'CTO',
    name: 'ประธานเจ้าหน้าที่เทคโนโลยี',
    nameEn: 'Chief Technology Officer',
    description: 'ผู้บริหารสูงสุดด้านเทคโนโลยี',
    department: 'ฝ่ายบริหาร',
    level: 'C-Level',
    minSalary: 150000,
    maxSalary: 400000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-cfo',
    code: 'CFO',
    name: 'ประธานเจ้าหน้าที่การเงิน',
    nameEn: 'Chief Financial Officer',
    description: 'ผู้บริหารสูงสุดด้านการเงิน',
    department: 'ฝ่ายบริหาร',
    level: 'C-Level',
    minSalary: 150000,
    maxSalary: 400000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // ============================================
  // HR Department
  // ============================================
  {
    id: 'pos-hr-director',
    code: 'HR-DIR',
    name: 'ผู้อำนวยการฝ่ายทรัพยากรบุคคล',
    nameEn: 'HR Director',
    description: 'บริหารจัดการฝ่าย HR ทั้งหมด',
    department: 'ฝ่ายทรัพยากรบุคคล',
    level: 'Director',
    minSalary: 80000,
    maxSalary: 150000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-hr-manager',
    code: 'HR-MGR',
    name: 'ผู้จัดการฝ่ายทรัพยากรบุคคล',
    nameEn: 'HR Manager',
    description: 'จัดการงาน HR ทั่วไป',
    department: 'ฝ่ายทรัพยากรบุคคล',
    level: 'Manager',
    minSalary: 50000,
    maxSalary: 80000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-hr-specialist',
    code: 'HR-SPEC',
    name: 'เจ้าหน้าที่ทรัพยากรบุคคล',
    nameEn: 'HR Specialist',
    description: 'ดำเนินงานด้าน HR',
    department: 'ฝ่ายทรัพยากรบุคคล',
    level: 'Mid',
    minSalary: 30000,
    maxSalary: 50000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-recruiter',
    code: 'RECRUITER',
    name: 'เจ้าหน้าที่สรรหาบุคลากร',
    nameEn: 'Recruiter',
    description: 'สรรหาและคัดเลือกบุคลากร',
    department: 'ฝ่ายทรัพยากรบุคคล',
    level: 'Mid',
    minSalary: 28000,
    maxSalary: 45000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // ============================================
  // IT Department - Development
  // ============================================
  {
    id: 'pos-engineering-manager',
    code: 'ENG-MGR',
    name: 'ผู้จัดการฝ่ายวิศวกรรม',
    nameEn: 'Engineering Manager',
    description: 'บริหารทีมพัฒนา',
    department: 'ฝ่ายเทคโนโลยีสารสนเทศ',
    level: 'Manager',
    minSalary: 80000,
    maxSalary: 150000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-tech-lead',
    code: 'TECH-LEAD',
    name: 'หัวหน้าทีมเทคนิค',
    nameEn: 'Tech Lead',
    description: 'นำทีมด้านเทคนิค',
    department: 'ฝ่ายเทคโนโลยีสารสนเทศ',
    level: 'Lead',
    minSalary: 70000,
    maxSalary: 120000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-senior-dev',
    code: 'SR-DEV',
    name: 'นักพัฒนาระดับสูง',
    nameEn: 'Senior Developer',
    description: 'พัฒนาซอฟต์แวร์ระดับสูง',
    department: 'ฝ่ายเทคโนโลยีสารสนเทศ',
    level: 'Senior',
    minSalary: 50000,
    maxSalary: 90000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-mid-dev',
    code: 'MID-DEV',
    name: 'นักพัฒนาระดับกลาง',
    nameEn: 'Mid-Level Developer',
    description: 'พัฒนาซอฟต์แวร์',
    department: 'ฝ่ายเทคโนโลยีสารสนเทศ',
    level: 'Mid',
    minSalary: 35000,
    maxSalary: 60000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-junior-dev',
    code: 'JR-DEV',
    name: 'นักพัฒนาระดับต้น',
    nameEn: 'Junior Developer',
    description: 'พัฒนาซอฟต์แวร์เบื้องต้น',
    department: 'ฝ่ายเทคโนโลยีสารสนเทศ',
    level: 'Junior',
    minSalary: 25000,
    maxSalary: 40000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // ============================================
  // IT Department - Infrastructure
  // ============================================
  {
    id: 'pos-devops',
    code: 'DEVOPS',
    name: 'วิศวกร DevOps',
    nameEn: 'DevOps Engineer',
    description: 'ดูแลระบบ CI/CD และโครงสร้างพื้นฐาน',
    department: 'ฝ่ายเทคโนโลยีสารสนเทศ',
    level: 'Mid',
    minSalary: 40000,
    maxSalary: 80000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-sysadmin',
    code: 'SYSADMIN',
    name: 'ผู้ดูแลระบบ',
    nameEn: 'System Administrator',
    description: 'ดูแลเซิร์ฟเวอร์และเครือข่าย',
    department: 'ฝ่ายเทคโนโลยีสารสนเทศ',
    level: 'Mid',
    minSalary: 35000,
    maxSalary: 70000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // ============================================
  // Finance & Accounting
  // ============================================
  {
    id: 'pos-finance-manager',
    code: 'FIN-MGR',
    name: 'ผู้จัดการฝ่ายการเงิน',
    nameEn: 'Finance Manager',
    description: 'บริหารจัดการด้านการเงิน',
    department: 'ฝ่ายการเงินและบัญชี',
    level: 'Manager',
    minSalary: 60000,
    maxSalary: 100000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-accountant',
    code: 'ACCOUNTANT',
    name: 'นักบัญชี',
    nameEn: 'Accountant',
    description: 'จัดทำบัญชีและรายงานการเงิน',
    department: 'ฝ่ายการเงินและบัญชี',
    level: 'Mid',
    minSalary: 25000,
    maxSalary: 45000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // ============================================
  // Marketing
  // ============================================
  {
    id: 'pos-marketing-manager',
    code: 'MKT-MGR',
    name: 'ผู้จัดการฝ่ายการตลาด',
    nameEn: 'Marketing Manager',
    description: 'วางแผนและบริหารการตลาด',
    department: 'ฝ่ายการตลาด',
    level: 'Manager',
    minSalary: 50000,
    maxSalary: 90000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-digital-marketer',
    code: 'DIGITAL-MKT',
    name: 'นักการตลาดดิจิทัล',
    nameEn: 'Digital Marketer',
    description: 'วางแผนและดำเนินการตลาดดิจิทัล',
    department: 'ฝ่ายการตลาด',
    level: 'Mid',
    minSalary: 30000,
    maxSalary: 55000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-content-creator',
    code: 'CONTENT',
    name: 'ผู้สร้างคอนเทนต์',
    nameEn: 'Content Creator',
    description: 'สร้างคอนเทนต์ทางการตลาด',
    department: 'ฝ่ายการตลาด',
    level: 'Junior',
    minSalary: 25000,
    maxSalary: 40000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // ============================================
  // Sales
  // ============================================
  {
    id: 'pos-sales-manager',
    code: 'SALES-MGR',
    name: 'ผู้จัดการฝ่ายขาย',
    nameEn: 'Sales Manager',
    description: 'บริหารทีมขาย',
    department: 'ฝ่ายขาย',
    level: 'Manager',
    minSalary: 45000,
    maxSalary: 80000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-sales-exec',
    code: 'SALES-EXEC',
    name: 'ผู้บริหารฝ่ายขาย',
    nameEn: 'Sales Executive',
    description: 'ขายสินค้าและบริการ',
    department: 'ฝ่ายขาย',
    level: 'Mid',
    minSalary: 25000,
    maxSalary: 50000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // ============================================
  // Customer Service
  // ============================================
  {
    id: 'pos-cs-manager',
    code: 'CS-MGR',
    name: 'ผู้จัดการฝ่ายบริการลูกค้า',
    nameEn: 'Customer Service Manager',
    description: 'บริหารทีมบริการลูกค้า',
    department: 'ฝ่ายบริการลูกค้า',
    level: 'Manager',
    minSalary: 40000,
    maxSalary: 70000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'pos-cs-agent',
    code: 'CS-AGENT',
    name: 'เจ้าหน้าที่บริการลูกค้า',
    nameEn: 'Customer Service Agent',
    description: 'ให้บริการและแก้ไขปัญหาลูกค้า',
    department: 'ฝ่ายบริการลูกค้า',
    level: 'Junior',
    minSalary: 18000,
    maxSalary: 30000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // ============================================
  // Administration
  // ============================================
  {
    id: 'pos-admin-officer',
    code: 'ADMIN-OFF',
    name: 'เจ้าหน้าที่ธุรการ',
    nameEn: 'Administrative Officer',
    description: 'งานธุรการทั่วไป',
    department: 'ฝ่ายธุรการ',
    level: 'Junior',
    minSalary: 18000,
    maxSalary: 28000,
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

/**
 * Validate position data with Zod
 */
function validatePositionData(data: unknown, context: string) {
  try {
    return validatePosition(data);
  } catch (error) {
    console.error(`❌ Validation failed for ${context}:`, error);
    throw error;
  }
}

async function seedPositions() {
  console.log('🌱 Seeding Positions...');

  const now = Timestamp.now();
  const batch = db.batch();

  for (const position of positions) {
    const docRef = db.collection('positions').doc(position.id);

    // ✅ Use stripUndefined for Firestore safety
    const positionPayload = stripUndefined({
      ...position,
      createdAt: now,
      updatedAt: now,
      tenantId: 'default', // ✅ Ensure tenantId is present
    });

    // ✅ Validate with Zod before writing
    const validated = validatePositionData(positionPayload, `${position.name} (${position.code})`);

    batch.set(docRef, validated);
    console.log(`  ✅ Created position: ${position.name} (${position.code})`);
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${positions.length} positions\n`);
}

// Run seed
seedPositions()
  .then(() => {
    console.log('✅ Position seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding positions:', error);
    process.exit(1);
  });
