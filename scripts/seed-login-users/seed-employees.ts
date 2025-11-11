/**
 * Seed Employees Script (Admin SDK Version)
 * Populates Firebase emulator with comprehensive employee data
 *
 * Usage: tsx scripts/seed-login-users/seed-employees.ts
 */

import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type {
	Address,
	Allowance,
	BankAccount,
	Benefits,
	Certification,
	DocumentRecord,
	EducationRecord,
	EmergencyContact,
	Employee,
	EmployeeStatus,
	EmploymentType,
	Gender,
	MaritalStatus,
	OvertimeConfig,
	ReportingTo,
	SalaryInfo,
	SocialSecurityInfo,
	TaxInfo,
	WorkHours,
	WorkLocation,
	WorkSchedule,
	WorkType,
} from '../../src/domains/people/features/employees/types/index.js';

// Initialize Firebase Admin (no credentials needed for emulator)
if (getApps().length === 0) {
	initializeApp({
		projectId: 'human-b4c2c',
	});
}

const db = getFirestore();

// Connect to emulator
db.settings({
	host: 'localhost:8080',
	ssl: false,
});

/**
 * Remove undefined values from object recursively
 * Firestore doesn't accept undefined values
 */
function removeUndefined<T>(obj: T): T {
	if (obj === null || obj === undefined) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => removeUndefined(item)) as T;
	}

	if (typeof obj === 'object') {
		const cleaned: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			if (value !== undefined) {
				cleaned[key] = removeUndefined(value);
			}
		}
		return cleaned as T;
	}

	return obj;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate random date within range
 */
function randomDate(start: Date, end: Date): Date {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
	const today = new Date();
	let age = today.getFullYear() - dateOfBirth.getFullYear();
	const monthDiff = today.getMonth() - dateOfBirth.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
		age--;
	}
	return age;
}

/**
 * Generate employee code
 */
function generateEmployeeCode(index: number): string {
	const year = new Date().getFullYear();
	const paddedIndex = String(index).padStart(3, '0');
	return `EMP-${year}-${paddedIndex}`;
}

/**
 * Generate Thai national ID (mock)
 */
function generateNationalId(): string {
	return `${Math.floor(Math.random() * 9) + 1}${Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('')}`;
}

/**
 * Generate phone number (Thai format)
 */
function generatePhoneNumber(): string {
	const prefixes = ['081', '082', '083', '084', '085', '086', '087', '088', '089'];
	const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
	const numbers = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
	return `${prefix}${numbers}`;
}

/**
 * Generate Thai address
 */
function generateAddress(): Address {
	const provinces = [
		'กรุงเทพมหานคร',
		'เชียงใหม่',
		'ภูเก็ต',
		'ชลบุรี',
		'นครราชสีมา',
		'สงขลา',
		'เชียงราย',
		'ขอนแก่น',
		'อุบลราชธานี',
		'สุราษฎร์ธานี',
	];
	const districts = ['เมือง', 'แม่ริม', 'สันกำแพง', 'หางดง', 'ดอยสะเก็ด'];
	const subDistricts = ['ช้างเผือก', 'ช้างม่อย', 'หนองหอย', 'สุเทพ', 'ป่าแดด'];

	const province = provinces[Math.floor(Math.random() * provinces.length)];
	const district = districts[Math.floor(Math.random() * districts.length)];
	const subDistrict = subDistricts[Math.floor(Math.random() * subDistricts.length)];

	return {
		addressLine1: `${Math.floor(Math.random() * 999) + 1} หมู่ ${Math.floor(Math.random() * 20) + 1}`,
		addressLine2: `ซอย ${Math.floor(Math.random() * 50) + 1}`,
		subDistrict,
		district,
		province,
		postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
		country: 'ประเทศไทย',
	};
}

// ============================================
// Seed Data Templates
// ============================================

interface SeedEmployeeTemplate {
	firstName: string;
	lastName: string;
	thaiFirstName: string;
	thaiLastName: string;
	nickname: string;
	gender: Gender;
	maritalStatus: MaritalStatus;
	position: string;
	level?: string;
	department: string;
	division?: string;
	team?: string;
	employmentType: EmploymentType;
	workType: WorkType;
	baseSalary: number;
	officeLocation: string;
}

const SEED_EMPLOYEES: SeedEmployeeTemplate[] = [
	// ===== IT Department =====
	{
		firstName: 'John',
		lastName: 'Smith',
		thaiFirstName: 'สมชาย',
		thaiLastName: 'ใจดี',
		nickname: 'จอห์น',
		gender: 'male',
		maritalStatus: 'single',
		position: 'Senior Software Engineer',
		level: 'Senior',
		department: 'IT',
		division: 'Engineering',
		team: 'Backend Team',
		employmentType: 'permanent',
		workType: 'full-time',
		baseSalary: 80000,
		officeLocation: 'กรุงเทพ',
	},
	{
		firstName: 'Sarah',
		lastName: 'Johnson',
		thaiFirstName: 'สุดารัตน์',
		thaiLastName: 'มั่นคง',
		nickname: 'แซร์ราห์',
		gender: 'female',
		maritalStatus: 'married',
		position: 'Frontend Developer',
		level: 'Mid-level',
		department: 'IT',
		division: 'Engineering',
		team: 'Frontend Team',
		employmentType: 'permanent',
		workType: 'full-time',
		baseSalary: 60000,
		officeLocation: 'กรุงเทพ',
	},
	{
		firstName: 'Michael',
		lastName: 'Chen',
		thaiFirstName: 'มนัส',
		thaiLastName: 'เฉลิมชัย',
		nickname: 'ไมค์',
		gender: 'male',
		maritalStatus: 'single',
		position: 'DevOps Engineer',
		level: 'Senior',
		department: 'IT',
		division: 'Engineering',
		team: 'Infrastructure',
		employmentType: 'permanent',
		workType: 'full-time',
		baseSalary: 75000,
		officeLocation: 'กรุงเทพ',
	},
	{
		firstName: 'Emily',
		lastName: 'Wong',
		thaiFirstName: 'เอมิลี',
		thaiLastName: 'วงศ์สวัสดิ์',
		nickname: 'เอ็ม',
		gender: 'female',
		maritalStatus: 'single',
		position: 'UX/UI Designer',
		level: 'Mid-level',
		department: 'IT',
		division: 'Design',
		team: 'Design Team',
		employmentType: 'permanent',
		workType: 'full-time',
		baseSalary: 55000,
		officeLocation: 'กรุงเทพ',
	},

	// ===== HR Department =====
	{
		firstName: 'Jessica',
		lastName: 'Taylor',
		thaiFirstName: 'จิราพร',
		thaiLastName: 'ศรีสุข',
		nickname: 'เจส',
		gender: 'female',
		maritalStatus: 'married',
		position: 'HR Manager',
		level: 'Manager',
		department: 'HR',
		division: 'Human Resources',
		employmentType: 'permanent',
		workType: 'full-time',
		baseSalary: 70000,
		officeLocation: 'กรุงเทพ',
	},
	{
		firstName: 'David',
		lastName: 'Lee',
		thaiFirstName: 'ดาวิด',
		thaiLastName: 'ลีละวัฒน์',
		nickname: 'เดฟ',
		gender: 'male',
		maritalStatus: 'single',
		position: 'Recruitment Specialist',
		level: 'Junior',
		department: 'HR',
		division: 'Human Resources',
		employmentType: 'permanent',
		workType: 'full-time',
		baseSalary: 40000,
		officeLocation: 'กรุงเทพ',
	},

	// ===== Finance Department =====
	{
		firstName: 'Amanda',
		lastName: 'Brown',
		thaiFirstName: 'อมรรัตน์',
		thaiLastName: 'บุญมี',
		nickname: 'อแมนด้า',
		gender: 'female',
		maritalStatus: 'married',
		position: 'Senior Accountant',
		level: 'Senior',
		department: 'Finance',
		division: 'Accounting',
		employmentType: 'permanent',
		workType: 'full-time',
		baseSalary: 65000,
		officeLocation: 'กรุงเทพ',
	},
	{
		firstName: 'Robert',
		lastName: 'Wilson',
		thaiFirstName: 'รพีพัฒน์',
		thaiLastName: 'วิไลกุล',
		nickname: 'บ็อบ',
		gender: 'male',
		maritalStatus: 'divorced',
		position: 'Financial Analyst',
		level: 'Mid-level',
		department: 'Finance',
		division: 'Financial Planning',
		employmentType: 'permanent',
		workType: 'full-time',
		baseSalary: 58000,
		officeLocation: 'กรุงเทพ',
	},

	// ===== Marketing Department =====
	{
		firstName: 'Jennifer',
		lastName: 'Martinez',
		thaiFirstName: 'เจนนิเฟอร์',
		thaiLastName: 'มาร์ติเนซ',
		nickname: 'เจน',
		gender: 'female',
		maritalStatus: 'single',
		position: 'Marketing Manager',
		level: 'Manager',
		department: 'Marketing',
		division: 'Digital Marketing',
		employmentType: 'permanent',
		workType: 'full-time',
		baseSalary: 72000,
		officeLocation: 'กรุงเทพ',
	},
	{
		firstName: 'Christopher',
		lastName: 'Anderson',
		thaiFirstName: 'คริสโตเฟอร์',
		thaiLastName: 'แอนเดอร์สัน',
		nickname: 'คริส',
		gender: 'male',
		maritalStatus: 'single',
		position: 'Content Creator',
		level: 'Junior',
		department: 'Marketing',
		division: 'Content',
		employmentType: 'contract',
		workType: 'full-time',
		baseSalary: 35000,
		officeLocation: 'เชียงใหม่',
	},

	// ===== Sales Department =====
	{
		firstName: 'Michelle',
		lastName: 'Garcia',
		thaiFirstName: 'มิเชล',
		thaiLastName: 'การ์เซีย',
		nickname: 'มิช',
		gender: 'female',
		maritalStatus: 'married',
		position: 'Sales Manager',
		level: 'Manager',
		department: 'Sales',
		division: 'Enterprise Sales',
		employmentType: 'permanent',
		workType: 'full-time',
		baseSalary: 75000,
		officeLocation: 'กรุงเทพ',
	},
	{
		firstName: 'Daniel',
		lastName: 'Rodriguez',
		thaiFirstName: 'ดนัย',
		thaiLastName: 'รอดริเกซ',
		nickname: 'แดน',
		gender: 'male',
		maritalStatus: 'single',
		position: 'Sales Executive',
		level: 'Mid-level',
		department: 'Sales',
		division: 'SME Sales',
		employmentType: 'permanent',
		workType: 'full-time',
		baseSalary: 45000,
		officeLocation: 'เชียงใหม่',
	},

	// ===== Part-time & Contract =====
	{
		firstName: 'Lisa',
		lastName: 'Thompson',
		thaiFirstName: 'ลิสา',
		thaiLastName: 'ธอมป์สัน',
		nickname: 'ลิซ',
		gender: 'female',
		maritalStatus: 'single',
		position: 'Graphic Designer',
		level: 'Junior',
		department: 'Marketing',
		division: 'Creative',
		employmentType: 'freelance',
		workType: 'part-time',
		baseSalary: 20000,
		officeLocation: 'กรุงเทพ',
	},
	{
		firstName: 'Kevin',
		lastName: 'White',
		thaiFirstName: 'เควิน',
		thaiLastName: 'ไวท์',
		nickname: 'เควิน',
		gender: 'male',
		maritalStatus: 'single',
		position: 'Junior Developer',
		level: 'Junior',
		department: 'IT',
		division: 'Engineering',
		team: 'Mobile Team',
		employmentType: 'intern',
		workType: 'part-time',
		baseSalary: 15000,
		officeLocation: 'กรุงเทพ',
	},

	// ===== Probation =====
	{
		firstName: 'Rachel',
		lastName: 'Harris',
		thaiFirstName: 'ราเชล',
		thaiLastName: 'แฮร์ริส',
		nickname: 'เรเชล',
		gender: 'female',
		maritalStatus: 'single',
		position: 'Business Analyst',
		level: 'Mid-level',
		department: 'IT',
		division: 'Business Intelligence',
		employmentType: 'probation',
		workType: 'full-time',
		baseSalary: 52000,
		officeLocation: 'กรุงเทพ',
	},
];

// ============================================
// Build Complete Employee Data
// ============================================

async function buildEmployeeData(
	template: SeedEmployeeTemplate,
	index: number,
	userIds: string[],
): Promise<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>> {
	const dateOfBirth = randomDate(new Date('1985-01-01'), new Date('2000-12-31'));
	const hireDate = randomDate(new Date('2020-01-01'), new Date('2025-01-01'));
	const currentAddress = generateAddress();

	// Emergency Contact
	const emergencyContact: EmergencyContact = {
		name: `${template.thaiFirstName} ${template.thaiLastName} (พ่อ/แม่)`,
		relationship: 'พ่อ',
		phoneNumber: generatePhoneNumber(),
	};

	// Salary Info
	const salary: SalaryInfo = {
		baseSalary: template.baseSalary,
		currency: 'THB',
		paymentFrequency: template.workType === 'part-time' ? 'hourly' : 'monthly',
		effectiveDate: hireDate,
		...(template.workType === 'part-time' && {
			hourlyRate: Math.round(template.baseSalary / 160), // สมมติ 160 ชม./เดือน
		}),
	};

	// Allowances
	const allowances: Allowance[] = [];
	if (template.workType === 'full-time') {
		allowances.push(
			{
				type: 'ค่าเดินทาง',
				amount: 2000,
				frequency: 'monthly',
			},
			{
				type: 'ค่าโทรศัพท์',
				amount: 800,
				frequency: 'monthly',
			},
		);

		if (template.level === 'Manager') {
			allowances.push({
				type: 'ค่าตำแหน่ง',
				amount: 5000,
				frequency: 'monthly',
			});
		}
	}

	// Social Security
	const socialSecurity: SocialSecurityInfo = {
		isEnrolled: template.employmentType === 'permanent' || template.employmentType === 'probation',
		...(template.employmentType === 'permanent' && {
			ssNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
			enrollmentDate: hireDate,
			hospitalCode: 'BKK001',
			hospitalName: 'โรงพยาบาลจุฬาลงกรณ์',
		}),
	};

	// Tax Info
	const tax: TaxInfo = {
		withholdingTax: template.employmentType !== 'freelance',
		...(template.employmentType !== 'freelance' && {
			taxId: generateNationalId(),
			withholdingRate: 5,
			taxReliefs:
				template.maritalStatus === 'married'
					? [
							{ type: 'ตัวเอง', amount: 60000 },
							{ type: 'คู่สมรส', amount: 60000 },
						]
					: [{ type: 'ตัวเอง', amount: 60000 }],
		}),
	};

	// Bank Account
	const bankAccount: BankAccount = {
		bankName: 'ธนาคารกสิกรไทย',
		accountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
		accountName: `${template.thaiFirstName} ${template.thaiLastName}`,
		branchName: 'สาขาสยาม',
	};

	// Work Location
	const workLocation: WorkLocation = {
		office: template.officeLocation,
		building: 'อาคาร A',
		floor: `ชั้น ${Math.floor(Math.random() * 10) + 1}`,
		seat: `A-${Math.floor(Math.random() * 100) + 1}`,
	};

	// Reporting To (if not entry-level)
	let reportingTo: ReportingTo | undefined;
	if (template.level !== 'Manager' && index > 0) {
		// หาผู้จัดการในแผนกเดียวกัน
		const managers = SEED_EMPLOYEES.filter(
			(emp) => emp.department === template.department && emp.level === 'Manager',
		);

		if (managers.length > 0) {
			const manager = managers[0];
			reportingTo = {
				employeeId: 'will-be-assigned', // จะ assign ภายหลัง
				employeeName: `${manager.firstName} ${manager.lastName}`,
				position: manager.position,
			};
		}
	}

	// Benefits
	const benefits: Benefits | undefined =
		template.employmentType === 'permanent'
			? {
					healthInsurance: true,
					lifeInsurance: true,
					providentFund: {
						isEnrolled: true,
						employeeContributionRate: 5,
						employerContributionRate: 5,
					},
					annualLeave: 10,
					sickLeave: 30,
					otherBenefits: ['ตรวจสุขภาพประจำปี', 'ประกันอุบัติเหตุ', 'โบนัสประจำปี'],
				}
			: undefined;

	// Education
	const education: EducationRecord[] = [
		{
			level: 'bachelor',
			institution: 'มหาวิทยาลัยเชียงใหม่',
			fieldOfStudy:
				template.department === 'IT'
					? 'วิทยาการคอมพิวเตอร์'
					: template.department === 'Finance'
						? 'บัญชี'
						: template.department === 'Marketing'
							? 'การตลาด'
							: 'บริหารธุรกิจ',
			graduationYear: 2015,
			gpa: Number((Math.random() * 1.5 + 2.5).toFixed(2)), // 2.5-4.0
		},
	];

	// Work Schedule
	const standardHours: WorkHours = {
		startTime: '09:00',
		endTime: '18:00',
		breakMinutes: 60,
	};

	const workSchedule: WorkSchedule = {
		scheduleType: 'fixed',
		hoursPerWeek: template.workType === 'full-time' ? 40 : 20,
		hoursPerDay: template.workType === 'full-time' ? 8 : 4,
		standardHours: {
			monday: standardHours,
			tuesday: standardHours,
			wednesday: standardHours,
			thursday: standardHours,
			friday: standardHours,
		},
	};

	// Overtime
	const overtime: OvertimeConfig = {
		isEligible: template.workType === 'full-time' && template.level !== 'Manager',
		rate: 1.5,
	};

	// Determine status
	let status: EmployeeStatus = 'active';
	let probationEndDate: Date | undefined;
	let confirmationDate: Date | undefined;

	if (template.employmentType === 'probation') {
		probationEndDate = new Date(hireDate);
		probationEndDate.setMonth(probationEndDate.getMonth() + 3);

		// ถ้าผ่าน probation period แล้ว ให้มี confirmation date
		if (probationEndDate < new Date()) {
			confirmationDate = probationEndDate;
		}
	}

	// Build complete employee object
	const employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> = {
		// Basic Info
		userId: userIds[index] || `mock-user-${index}`,
		employeeCode: generateEmployeeCode(index + 1),

		// Personal Information
		firstName: template.firstName,
		lastName: template.lastName,
		thaiFirstName: template.thaiFirstName,
		thaiLastName: template.thaiLastName,
		nickname: template.nickname,
		email: `${template.firstName.toLowerCase()}.${template.lastName.toLowerCase()}@company.com`,
		personalEmail: `${template.firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}@gmail.com`,
		phoneNumber: generatePhoneNumber(),
		emergencyContact,

		// Personal Details
		dateOfBirth,
		age: calculateAge(dateOfBirth),
		gender: template.gender,
		maritalStatus: template.maritalStatus,
		nationality: 'ไทย',
		religion: 'พุทธ',

		// National ID
		nationalId: generateNationalId(),
		nationalIdIssueDate: randomDate(new Date('2015-01-01'), new Date('2020-12-31')),
		nationalIdExpiryDate: new Date('2030-12-31'),

		// Address
		currentAddress,
		permanentAddress: Math.random() > 0.5 ? generateAddress() : undefined,

		// Employment Information
		hireDate,
		probationEndDate,
		confirmationDate,
		status,
		employmentType: template.employmentType,
		workType: template.workType,

		// Organization Structure
		position: template.position,
		level: template.level,
		department: template.department,
		division: template.division,
		team: template.team,

		// Reporting
		reportingTo,

		// Location
		workLocation,

		// Compensation & Benefits
		salary,
		allowances: allowances.length > 0 ? allowances : undefined,
		benefits,

		// Tax & Social Security
		socialSecurity,
		tax,
		bankAccount,

		// Education
		education,

		// Work Schedule
		workSchedule,
		overtime,

		// Notes
		notes: `Seed employee data created for testing - ${template.firstName} ${template.lastName}`,
	};

	return employee;
}

// ============================================
// Seed Employees Function
// ============================================

async function seedEmployees() {
	console.log('🌱 Starting employee seeding with Admin SDK...\n');
	console.log('📡 Connected to Firestore Emulator at localhost:8080\n');

	try {
		// Fetch existing users to link with employees
		console.log('📋 Fetching existing users...');
		const usersSnapshot = await db.collection('users').get();
		const userIds = usersSnapshot.docs.map((doc) => doc.id);
		console.log(`   ✓ Found ${userIds.length} users\n`);

		console.log('👥 Creating employees...\n');

		const employeeIds: string[] = [];

		for (let i = 0; i < SEED_EMPLOYEES.length; i++) {
			const template = SEED_EMPLOYEES[i];

			try {
				// Build complete employee data
				const employeeData = await buildEmployeeData(template, i, userIds);

				// Create employee document
				const employeeId = `emp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
				const employeeRef = db.collection('employees').doc(employeeId);

				// Remove undefined values before saving to Firestore
				const cleanedData = removeUndefined({
					id: employeeId,
					...employeeData,
					createdAt: Timestamp.now(),
					updatedAt: Timestamp.now(),
				});

				await employeeRef.set(cleanedData);

				employeeIds.push(employeeId);

				console.log(`✅ Created: ${template.firstName} ${template.lastName}`);
				console.log(`   📋 Code: ${employeeData.employeeCode}`);
				console.log(`   📧 Email: ${employeeData.email}`);
				console.log(`   🏢 Position: ${template.position}`);
				console.log(`   🏛️  Department: ${template.department}`);
				console.log(`   💼 Type: ${template.employmentType} (${template.workType})`);
				console.log(`   💰 Salary: ${template.baseSalary.toLocaleString()} THB`);
				console.log();
			} catch (error) {
				console.error(`❌ Failed to create ${template.firstName} ${template.lastName}:`, error);
			}
		}

		console.log('─'.repeat(70));
		console.log(`\n🎉 Employee seeding completed! Created ${employeeIds.length} employees.\n`);

		// Summary by department
		console.log('📊 Summary by Department:');
		console.log('─'.repeat(50));
		const departments = SEED_EMPLOYEES.reduce(
			(acc, emp) => {
				acc[emp.department] = (acc[emp.department] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		Object.entries(departments).forEach(([dept, count]) => {
			console.log(`   ${dept.padEnd(20)} ${count} employee(s)`);
		});

		console.log('\n💡 Tips:');
		console.log('   • View employees in Firestore Emulator UI: http://localhost:4000');
		console.log('   • Use the employee management interface to view details');
		console.log('   • These employees are for development/testing only\n');
	} catch (error) {
		console.error('❌ Seeding failed:', error);
		throw error;
	}

	process.exit(0);
}

// Run seeding
seedEmployees().catch((error) => {
	console.error('❌ Fatal error:', error);
	process.exit(1);
});
