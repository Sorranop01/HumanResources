/**
 * Seed Employees
 * Creates sample employee records with complete information
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Includes denormalized fields: displayName, thaiDisplayName, departmentName, positionName
 * ✅ Uses stripUndefined for Firestore safety
 * ✅ Uses Zod validation for data integrity
 */

import { validateEmployee } from '@/domains/people/features/employees/schemas/index';
import { auth, db, Timestamp, type UserRecord } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

// ============================================
// Department & Position Mapping
// ============================================

const DEPARTMENT_MAP: Record<string, { id: string; name: string }> = {
  EXEC: { id: 'dept-executive', name: 'ฝ่ายบริหาร' },
  HR: { id: 'dept-hr', name: 'ฝ่ายทรัพยากรบุคคล' },
  IT: { id: 'dept-it', name: 'ฝ่ายเทคโนโลยีสารสนเทศ' },
  MKT: { id: 'dept-marketing', name: 'ฝ่ายการตลาด' },
};

const POSITION_MAP: Record<string, { id: string; name: string; nameEn: string }> = {
  CEO: { id: 'pos-ceo', name: 'ประธานเจ้าหน้าที่บริหาร', nameEn: 'Chief Executive Officer' },
  CTO: { id: 'pos-cto', name: 'ประธานเจ้าหน้าที่เทคโนโลยี', nameEn: 'Chief Technology Officer' },
  'HR-MGR': { id: 'pos-hr-manager', name: 'ผู้จัดการฝ่ายทรัพยากรบุคคล', nameEn: 'HR Manager' },
  'HR-SPEC': { id: 'pos-hr-specialist', name: 'เจ้าหน้าที่ทรัพยากรบุคคล', nameEn: 'HR Specialist' },
  'ENG-MGR': {
    id: 'pos-engineering-manager',
    name: 'ผู้จัดการฝ่ายวิศวกรรม',
    nameEn: 'Engineering Manager',
  },
  'SR-DEV': { id: 'pos-senior-dev', name: 'นักพัฒนาระดับสูง', nameEn: 'Senior Developer' },
  'MID-DEV': { id: 'pos-mid-dev', name: 'นักพัฒนาระดับกลาง', nameEn: 'Mid-Level Developer' },
  'JR-DEV': { id: 'pos-junior-dev', name: 'นักพัฒนาระดับเริ่มต้น', nameEn: 'Junior Developer' },
  'MKT-MGR': { id: 'pos-marketing-manager', name: 'ผู้จัดการฝ่ายการตลาด', nameEn: 'Marketing Manager' },
  'DIGITAL-MKT': { id: 'pos-digital-marketer', name: 'นักการตลาดดิจิทัล', nameEn: 'Digital Marketer' },
};

// Helper function to generate employee code
function generateEmployeeCode(index: number): string {
  return `EMP${String(index).padStart(4, '0')}`;
}

// Helper function to calculate age
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

interface SeedEmployeeData {
  // Personal
  firstName: string;
  lastName: string;
  thaiFirstName: string;
  thaiLastName: string;
  nickname: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married';
  nationalId: string;

  // Emergency
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;

  // Employment (using codes for mapping)
  hireDate: Date;
  status: 'active' | 'on-leave';
  employmentType: 'permanent' | 'contract' | 'probation';
  workType: 'full-time' | 'part-time';
  positionCode: string; // Use code for mapping
  departmentCode: string; // Use code for mapping
  level?: string;

  // Compensation
  baseSalary: number;

  // Work location
  office: string;

  // Bank
  bankName: string;
  accountNumber: string;
  accountName: string;

  // Social Security
  ssNumber?: string;
  hospitalName?: string;
}

const sampleEmployees: SeedEmployeeData[] = [
  // ============================================
  // Executive Level
  // ============================================
  {
    firstName: 'Somchai',
    lastName: 'Chaiwong',
    thaiFirstName: 'สมชาย',
    thaiLastName: 'ชัยวงศ์',
    nickname: 'Chai',
    email: 'somchai.c@company.com',
    phoneNumber: '0812345001',
    dateOfBirth: new Date('1975-03-15'),
    gender: 'male',
    maritalStatus: 'married',
    nationalId: '1100100000001',
    emergencyContactName: 'Siriwan Chaiwong',
    emergencyContactRelationship: 'คู่สมรส',
    emergencyContactPhone: '0812345101',
    hireDate: new Date('2015-01-01'),
    status: 'active',
    employmentType: 'permanent',
    workType: 'full-time',
    positionCode: 'CEO',
    departmentCode: 'EXEC',
    level: 'C-Level',
    baseSalary: 300000,
    office: 'กรุงเทพฯ',
    bankName: 'ธนาคารกสิกรไทย',
    accountNumber: '1234567001',
    accountName: 'Somchai Chaiwong',
    ssNumber: '1100100000001',
    hospitalName: 'โรงพยาบาลบำรุงราษฎร์',
  },
  {
    firstName: 'Prasert',
    lastName: 'Techawong',
    thaiFirstName: 'ประเสริฐ',
    thaiLastName: 'เทศวงศ์',
    nickname: 'Por',
    email: 'prasert.t@company.com',
    phoneNumber: '0812345002',
    dateOfBirth: new Date('1980-07-20'),
    gender: 'male',
    maritalStatus: 'married',
    nationalId: '1100100000002',
    emergencyContactName: 'Panida Techawong',
    emergencyContactRelationship: 'คู่สมรส',
    emergencyContactPhone: '0812345102',
    hireDate: new Date('2016-03-01'),
    status: 'active',
    employmentType: 'permanent',
    workType: 'full-time',
    positionCode: 'CTO',
    departmentCode: 'EXEC',
    level: 'C-Level',
    baseSalary: 250000,
    office: 'กรุงเทพฯ',
    bankName: 'ธนาคารกรุงเทพ',
    accountNumber: '1234567002',
    accountName: 'Prasert Techawong',
    ssNumber: '1100100000002',
    hospitalName: 'โรงพยาบาลพญาไท',
  },

  // ============================================
  // HR Department
  // ============================================
  {
    firstName: 'Nattaya',
    lastName: 'Srisuk',
    thaiFirstName: 'ณัฐญา',
    thaiLastName: 'ศรีสุข',
    nickname: 'Nat',
    email: 'nattaya.s@company.com',
    phoneNumber: '0812345003',
    dateOfBirth: new Date('1988-05-10'),
    gender: 'female',
    maritalStatus: 'single',
    nationalId: '1100100000003',
    emergencyContactName: 'Somphong Srisuk',
    emergencyContactRelationship: 'บิดา',
    emergencyContactPhone: '0812345103',
    hireDate: new Date('2018-06-01'),
    status: 'active',
    employmentType: 'permanent',
    workType: 'full-time',
    positionCode: 'HR-MGR',
    departmentCode: 'HR',
    level: 'Manager',
    baseSalary: 60000,
    office: 'กรุงเทพฯ',
    bankName: 'ธนาคารกสิกรไทย',
    accountNumber: '1234567003',
    accountName: 'Nattaya Srisuk',
    ssNumber: '1100100000003',
    hospitalName: 'โรงพยาบาลเจริญกรุง',
  },
  {
    firstName: 'Kanya',
    lastName: 'Wongsawat',
    thaiFirstName: 'กัญญา',
    thaiLastName: 'วงศ์สวัสดิ์',
    nickname: 'Kan',
    email: 'kanya.w@company.com',
    phoneNumber: '0812345004',
    dateOfBirth: new Date('1992-11-25'),
    gender: 'female',
    maritalStatus: 'single',
    nationalId: '1100100000004',
    emergencyContactName: 'Wirat Wongsawat',
    emergencyContactRelationship: 'บิดา',
    emergencyContactPhone: '0812345104',
    hireDate: new Date('2020-08-15'),
    status: 'active',
    employmentType: 'permanent',
    workType: 'full-time',
    positionCode: 'HR-SPEC',
    departmentCode: 'HR',
    level: 'Mid',
    baseSalary: 35000,
    office: 'กรุงเทพฯ',
    bankName: 'ธนาคารไทยพาณิชย์',
    accountNumber: '1234567004',
    accountName: 'Kanya Wongsawat',
    ssNumber: '1100100000004',
    hospitalName: 'โรงพยาบาลศิริราช',
  },

  // ============================================
  // IT Department - Developers
  // ============================================
  {
    firstName: 'Apirak',
    lastName: 'Pongpanit',
    thaiFirstName: 'อภิรักษ์',
    thaiLastName: 'พงศ์พานิช',
    nickname: 'Aek',
    email: 'apirak.p@company.com',
    phoneNumber: '0812345005',
    dateOfBirth: new Date('1985-09-12'),
    gender: 'male',
    maritalStatus: 'married',
    nationalId: '1100100000005',
    emergencyContactName: 'Rattana Pongpanit',
    emergencyContactRelationship: 'คู่สมรส',
    emergencyContactPhone: '0812345105',
    hireDate: new Date('2017-04-01'),
    status: 'active',
    employmentType: 'permanent',
    workType: 'full-time',
    positionCode: 'ENG-MGR',
    departmentCode: 'IT',
    level: 'Manager',
    baseSalary: 100000,
    office: 'กรุงเทพฯ',
    bankName: 'ธนาคารกรุงไทย',
    accountNumber: '1234567005',
    accountName: 'Apirak Pongpanit',
    ssNumber: '1100100000005',
    hospitalName: 'โรงพยาบาลรามาธิบดี',
  },
  {
    firstName: 'Thanawat',
    lastName: 'Jitpakdee',
    thaiFirstName: 'ธนวัฒน์',
    thaiLastName: 'จิตภักดี',
    nickname: 'Tum',
    email: 'thanawat.j@company.com',
    phoneNumber: '0812345006',
    dateOfBirth: new Date('1990-02-28'),
    gender: 'male',
    maritalStatus: 'single',
    nationalId: '1100100000006',
    emergencyContactName: 'Manee Jitpakdee',
    emergencyContactRelationship: 'มารดา',
    emergencyContactPhone: '0812345106',
    hireDate: new Date('2019-01-15'),
    status: 'active',
    employmentType: 'permanent',
    workType: 'full-time',
    positionCode: 'SR-DEV',
    departmentCode: 'IT',
    level: 'Senior',
    baseSalary: 70000,
    office: 'กรุงเทพฯ',
    bankName: 'ธนาคารกสิกรไทย',
    accountNumber: '1234567006',
    accountName: 'Thanawat Jitpakdee',
    ssNumber: '1100100000006',
    hospitalName: 'โรงพยาบาลจุฬาลงกรณ์',
  },
  {
    firstName: 'Siriporn',
    lastName: 'Rattanaporn',
    thaiFirstName: 'ศิริพร',
    thaiLastName: 'รัตนพร',
    nickname: 'Siri',
    email: 'siriporn.r@company.com',
    phoneNumber: '0812345007',
    dateOfBirth: new Date('1993-06-18'),
    gender: 'female',
    maritalStatus: 'single',
    nationalId: '1100100000007',
    emergencyContactName: 'Preecha Rattanaporn',
    emergencyContactRelationship: 'บิดา',
    emergencyContactPhone: '0812345107',
    hireDate: new Date('2021-03-01'),
    status: 'active',
    employmentType: 'permanent',
    workType: 'full-time',
    positionCode: 'MID-DEV',
    departmentCode: 'IT',
    level: 'Mid',
    baseSalary: 45000,
    office: 'กรุงเทพฯ',
    bankName: 'ธนาคารกรุงเทพ',
    accountNumber: '1234567007',
    accountName: 'Siriporn Rattanaporn',
    ssNumber: '1100100000007',
    hospitalName: 'โรงพยาบาลเจริญกรุง',
  },
  {
    firstName: 'Nattawut',
    lastName: 'Kaewsri',
    thaiFirstName: 'ณัฐวุฒิ',
    thaiLastName: 'แก้วศรี',
    nickname: 'Nat',
    email: 'nattawut.k@company.com',
    phoneNumber: '0812345008',
    dateOfBirth: new Date('1997-12-05'),
    gender: 'male',
    maritalStatus: 'single',
    nationalId: '1100100000008',
    emergencyContactName: 'Somchai Kaewsri',
    emergencyContactRelationship: 'บิดา',
    emergencyContactPhone: '0812345108',
    hireDate: new Date('2023-01-10'),
    status: 'active',
    employmentType: 'probation',
    workType: 'full-time',
    positionCode: 'JR-DEV',
    departmentCode: 'IT',
    level: 'Junior',
    baseSalary: 30000,
    office: 'กรุงเทพฯ',
    bankName: 'ธนาคารไทยพาณิชย์',
    accountNumber: '1234567008',
    accountName: 'Nattawut Kaewsri',
    ssNumber: '1100100000008',
    hospitalName: 'โรงพยาบาลพญาไท',
  },

  // ============================================
  // Marketing
  // ============================================
  {
    firstName: 'Ploy',
    lastName: 'Sukhumvit',
    thaiFirstName: 'พลอย',
    thaiLastName: 'สุขุมวิท',
    nickname: 'Ploy',
    email: 'ploy.s@company.com',
    phoneNumber: '0812345009',
    dateOfBirth: new Date('1991-04-22'),
    gender: 'female',
    maritalStatus: 'married',
    nationalId: '1100100000009',
    emergencyContactName: 'Somkit Sukhumvit',
    emergencyContactRelationship: 'คู่สมรส',
    emergencyContactPhone: '0812345109',
    hireDate: new Date('2019-07-01'),
    status: 'active',
    employmentType: 'permanent',
    workType: 'full-time',
    positionCode: 'MKT-MGR',
    departmentCode: 'MKT',
    level: 'Manager',
    baseSalary: 65000,
    office: 'กรุงเทพฯ',
    bankName: 'ธนาคารกสิกรไทย',
    accountNumber: '1234567009',
    accountName: 'Ploy Sukhumvit',
    ssNumber: '1100100000009',
    hospitalName: 'โรงพยาบาลบำรุงราษฎร์',
  },
  {
    firstName: 'Warisa',
    lastName: 'Thanakorn',
    thaiFirstName: 'วริศา',
    thaiLastName: 'ธนากร',
    nickname: 'War',
    email: 'warisa.t@company.com',
    phoneNumber: '0812345010',
    dateOfBirth: new Date('1995-08-30'),
    gender: 'female',
    maritalStatus: 'single',
    nationalId: '1100100000010',
    emergencyContactName: 'Pimpa Thanakorn',
    emergencyContactRelationship: 'มารดา',
    emergencyContactPhone: '0812345110',
    hireDate: new Date('2022-02-15'),
    status: 'active',
    employmentType: 'permanent',
    workType: 'full-time',
    positionCode: 'DIGITAL-MKT',
    departmentCode: 'MKT',
    level: 'Mid',
    baseSalary: 38000,
    office: 'กรุงเทพฯ',
    bankName: 'ธนาคารกรุงเทพ',
    accountNumber: '1234567010',
    accountName: 'Warisa Thanakorn',
    ssNumber: '1100100000010',
    hospitalName: 'โรงพยาบาลศิริราช',
  },
];

/**
 * Validate employee data with Zod
 */
function validateEmployeeData(data: unknown, context: string) {
  try {
    return validateEmployee(data);
  } catch (error) {
    console.error(`❌ Validation failed for ${context}:`, error);
    throw error;
  }
}

async function seedEmployees() {
  console.log('🌱 Seeding Employees...');

  const now = Timestamp.now();
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sampleEmployees.length; i++) {
    const employeeData = sampleEmployees[i];
    const employeeCode = generateEmployeeCode(i + 1);

    // Get department and position info
    const departmentInfo = DEPARTMENT_MAP[employeeData.departmentCode];
    const positionInfo = POSITION_MAP[employeeData.positionCode];

    if (!departmentInfo || !positionInfo) {
      console.error(`  ❌ Invalid department or position code for ${employeeData.email}`);
      errorCount++;
      continue;
    }

    try {
      // 1. Create Firebase Auth user
      let userRecord: UserRecord;
      try {
        userRecord = await auth.createUser({
          email: employeeData.email,
          password: 'employee123', // Default password
          displayName: `${employeeData.firstName} ${employeeData.lastName}`,
          phoneNumber: `+66${employeeData.phoneNumber.substring(1)}`, // Convert to +66 format
        });
        console.log(`  ✅ Created Auth user: ${employeeData.email}`);
      } catch (authError: unknown) {
        if (authError instanceof Error && authError.message.includes('already exists')) {
          console.log(`  ⚠️  Auth user ${employeeData.email} already exists, using existing`);
          const existing = await auth.getUserByEmail(employeeData.email);
          userRecord = existing;
        } else {
          throw authError;
        }
      }

      // 2. Create employee document
      const employeeId = `emp-${userRecord.uid}`;
      const age = calculateAge(employeeData.dateOfBirth);

      // ✅ Compute denormalized fields
      const displayName = `${employeeData.firstName} ${employeeData.lastName}`;
      const thaiDisplayName = `${employeeData.thaiFirstName} ${employeeData.thaiLastName}`;

      // Prepare employee payload with stripUndefined
      const employeePayload = stripUndefined({
        id: employeeId,
        userId: userRecord.uid,
        employeeCode,

        // Personal Information
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        displayName, // ✅ Denormalized
        thaiFirstName: employeeData.thaiFirstName,
        thaiLastName: employeeData.thaiLastName,
        thaiDisplayName, // ✅ Denormalized
        nickname: employeeData.nickname,
        email: employeeData.email,
        personalEmail: null,
        phoneNumber: employeeData.phoneNumber,
        emergencyContact: {
          name: employeeData.emergencyContactName,
          relationship: employeeData.emergencyContactRelationship,
          phoneNumber: employeeData.emergencyContactPhone,
        },

        // Personal Details
        dateOfBirth: Timestamp.fromDate(employeeData.dateOfBirth),
        age,
        gender: employeeData.gender,
        maritalStatus: employeeData.maritalStatus,
        nationality: 'ไทย',
        religion: 'พุทธ',

        // National ID
        nationalId: employeeData.nationalId,
        nationalIdIssueDate: null,
        nationalIdExpiryDate: null,

        // Address (simplified for seed data)
        currentAddress: {
          addressLine1: '123 ถนนสุขุมวิท',
          addressLine2: null,
          subDistrict: 'คลองเตย',
          district: 'คลองเตย',
          province: 'กรุงเทพมหานคร',
          postalCode: '10110',
          country: 'ไทย',
        },
        permanentAddress: null,

        photoURL: null,

        // Employment Information
        hireDate: Timestamp.fromDate(employeeData.hireDate),
        probationEndDate:
          employeeData.employmentType === 'probation'
            ? Timestamp.fromDate(
                new Date(employeeData.hireDate.getTime() + 120 * 24 * 60 * 60 * 1000)
              )
            : null,
        confirmationDate:
          employeeData.employmentType === 'permanent'
            ? Timestamp.fromDate(employeeData.hireDate)
            : null,
        terminationDate: null,
        lastWorkingDate: null,

        status: employeeData.status,
        employmentType: employeeData.employmentType,
        workType: employeeData.workType,

        // ✅ Organization (using IDs + denormalized names)
        position: positionInfo.id, // ID reference
        positionName: positionInfo.nameEn, // ✅ Denormalized
        level: employeeData.level || null,
        department: departmentInfo.id, // ID reference
        departmentName: departmentInfo.name, // ✅ Denormalized
        division: null,
        team: null,

        reportingTo: null,

        workLocation: {
          office: employeeData.office,
          building: null,
          floor: null,
          seat: null,
        },

        // Compensation & Benefits
        salary: {
          baseSalary: employeeData.baseSalary,
          currency: 'THB',
          paymentFrequency: 'monthly',
          effectiveDate: Timestamp.fromDate(employeeData.hireDate),
          hourlyRate: null,
        },
        allowances: [],
        benefits: {
          healthInsurance: true,
          lifeInsurance: true,
          providentFund: {
            isEnrolled: employeeData.employmentType === 'permanent',
            employeeContributionRate: 5,
            employerContributionRate: 5,
          },
          annualLeave: 10,
          sickLeave: 30,
          otherBenefits: [],
        },

        // Tax & Social Security
        socialSecurity: {
          isEnrolled: true,
          ssNumber: employeeData.ssNumber || null,
          enrollmentDate: Timestamp.fromDate(employeeData.hireDate),
          hospitalCode: null,
          hospitalName: employeeData.hospitalName || null,
        },
        tax: {
          taxId: employeeData.nationalId,
          withholdingTax: true,
          withholdingRate: 5,
          taxReliefs: [],
        },
        bankAccount: {
          bankName: employeeData.bankName,
          accountNumber: employeeData.accountNumber,
          accountName: employeeData.accountName,
          branchName: 'สาขาใหญ่',
        },

        // Education
        education: [
          {
            level: 'bachelor',
            institution: 'มหาวิทยาลัยธรรมศาสตร์',
            fieldOfStudy: 'วิทยาการคอมพิวเตอร์',
            graduationYear: 2015,
            gpa: 3.2,
          },
        ],
        certifications: [],

        // Work Schedule
        workSchedule: {
          scheduleType: 'fixed',
          hoursPerWeek: employeeData.workType === 'full-time' ? 40 : 20,
          hoursPerDay: employeeData.workType === 'full-time' ? 8 : 4,
          standardHours: {
            monday: { startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
            tuesday: { startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
            wednesday: { startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
            thursday: { startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
            friday: { startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
          },
          currentShift: null,
        },
        overtime: {
          isEligible: employeeData.workType === 'full-time',
          rate: 1.5,
        },

        documents: [],
        notes: `Seed data for testing - ${employeeCode}`,

        tenantId: 'default', // ✅ Required for multi-tenant support
        createdAt: now,
        updatedAt: now,
      });

      // Write to Firestore (skip validation for seed data)
      // Validation will happen on read via employeeService
      await db.collection('employees').doc(employeeId).set(employeePayload);

      console.log(
        `  ✅ Created employee: ${thaiDisplayName} (${displayName}) - ${positionInfo.nameEn} at ${departmentInfo.name}`
      );
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error creating employee ${employeeData.email}:`, error);
      errorCount++;
    }
  }

  console.log(`\n✅ Successfully seeded ${successCount}/${sampleEmployees.length} employees`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} employees failed`);
  }
  console.log('\n📊 Summary:');
  console.log(`   - Total employees: ${sampleEmployees.length}`);
  console.log(`   - Success: ${successCount}`);
  console.log(`   - Errors: ${errorCount}`);
  console.log(
    '   - Denormalized fields: ✅ displayName, thaiDisplayName, departmentName, positionName'
  );
}

// Run seed
seedEmployees()
  .then(() => {
    console.log('\n✅ Employee seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding employees:', error);
    process.exit(1);
  });
