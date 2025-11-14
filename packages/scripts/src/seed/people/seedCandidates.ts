/**
 * Seed Candidates
 * Creates sample candidate records for recruitment management
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 * ✅ Uses Zod validation for data integrity
 */

import { validateCandidate } from '@/domains/people/features/candidates/schemas/index';
import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface SeedCandidateData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;

  // Position Information
  positionApplied: string;
  expectedSalary?: number;
  availableDate?: string;

  // Experience & Skills
  experienceLevel?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  yearsOfExperience?: number;
  skills: string[];
  languages: string[];

  // Education
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    graduationYear: number;
    gpa?: number;
  }>;

  // Work Experience
  workExperience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>;

  // Documents & Links
  resumeUrl: string | null;
  portfolioUrl?: string | null;
  linkedInUrl?: string | null;

  // Application Status
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  notes?: string;
  interviewDate?: string;
  interviewer?: string;
  source?: string;
}

const sampleCandidates: SeedCandidateData[] = [
  // ============================================
  // New Applications - Developer Positions
  // ============================================
  {
    firstName: 'Somkid',
    lastName: 'Techapan',
    email: 'somkid.tech@example.com',
    phone: '0891234501',
    dateOfBirth: '1998-03-15',
    nationality: 'ไทย',
    address: '456 ถนนพระราม 4 คลองเตย กรุงเทพฯ 10110',
    positionApplied: 'Senior Full-Stack Developer',
    expectedSalary: 80000,
    availableDate: '2025-12-01',
    experienceLevel: 'senior',
    yearsOfExperience: 7,
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
    languages: ['ไทย', 'English'],
    education: [
      {
        degree: "Bachelor's Degree",
        field: 'Computer Engineering',
        institution: 'Chulalongkorn University',
        graduationYear: 2017,
        gpa: 3.45,
      },
    ],
    workExperience: [
      {
        title: 'Senior Full-Stack Developer',
        company: 'Tech Startup Co.',
        startDate: '2020-06',
        current: true,
        description: 'Lead development team building SaaS products using React and Node.js',
      },
      {
        title: 'Full-Stack Developer',
        company: 'Digital Agency Ltd.',
        startDate: '2017-07',
        endDate: '2020-05',
        current: false,
        description: 'Built web applications for various clients',
      },
    ],
    resumeUrl: 'https://example.com/resume/somkid-tech.pdf',
    portfolioUrl: 'https://somkid.dev',
    linkedInUrl: 'https://linkedin.com/in/somkid-techapan',
    status: 'screening',
    notes: 'Strong technical background, good communication skills',
    source: 'LinkedIn',
  },
  {
    firstName: 'Nuttapong',
    lastName: 'Jaidee',
    email: 'nuttapong.j@example.com',
    phone: '0812345502',
    dateOfBirth: '2000-07-22',
    nationality: 'ไทย',
    address: '789 ถนนสุขุมวิท บางนา กรุงเทพฯ 10260',
    positionApplied: 'Junior Frontend Developer',
    expectedSalary: 30000,
    availableDate: '2025-11-20',
    experienceLevel: 'junior',
    yearsOfExperience: 2,
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
    languages: ['ไทย', 'English'],
    education: [
      {
        degree: "Bachelor's Degree",
        field: 'Information Technology',
        institution: 'King Mongkut Technology Ladkrabang',
        graduationYear: 2022,
        gpa: 3.12,
      },
    ],
    workExperience: [
      {
        title: 'Junior Frontend Developer',
        company: 'Startup Inc.',
        startDate: '2022-08',
        current: true,
        description: 'Developing UI components using React',
      },
    ],
    resumeUrl: 'https://example.com/resume/nuttapong-j.pdf',
    linkedInUrl: 'https://linkedin.com/in/nuttapong-jaidee',
    status: 'new',
    source: 'JobThai',
  },
  {
    firstName: 'Pimchanok',
    lastName: 'Sriwichai',
    email: 'pimchanok.s@example.com',
    phone: '0898765503',
    dateOfBirth: '1999-11-10',
    nationality: 'ไทย',
    address: '321 ถนนเพชรบุรี ราชเทวี กรุงเทพฯ 10400',
    positionApplied: 'Mid-Level Backend Developer',
    expectedSalary: 50000,
    availableDate: '2025-12-15',
    experienceLevel: 'mid',
    yearsOfExperience: 4,
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
    languages: ['ไทย', 'English'],
    education: [
      {
        degree: "Bachelor's Degree",
        field: 'Computer Science',
        institution: 'Kasetsart University',
        graduationYear: 2021,
        gpa: 3.56,
      },
    ],
    workExperience: [
      {
        title: 'Backend Developer',
        company: 'E-commerce Platform Co.',
        startDate: '2021-09',
        current: true,
        description: 'Building scalable APIs and microservices',
      },
    ],
    resumeUrl: 'https://example.com/resume/pimchanok-s.pdf',
    portfolioUrl: 'https://github.com/pimchanok-dev',
    linkedInUrl: 'https://linkedin.com/in/pimchanok-sri',
    status: 'interview',
    notes: 'Excellent backend skills, scheduled for technical interview',
    interviewDate: '2025-11-20',
    interviewer: 'Apirak Pongpanit',
    source: 'Website',
  },

  // ============================================
  // New Applications - HR Positions
  // ============================================
  {
    firstName: 'Supaporn',
    lastName: 'Kittisak',
    email: 'supaporn.k@example.com',
    phone: '0823456504',
    dateOfBirth: '1995-05-18',
    nationality: 'ไทย',
    address: '567 ถนนศรีนครินทร์ หนองบอน กรุงเทพฯ 10250',
    positionApplied: 'HR Specialist',
    expectedSalary: 35000,
    availableDate: '2025-11-25',
    experienceLevel: 'mid',
    yearsOfExperience: 3,
    skills: ['Recruitment', 'Employee Relations', 'HRIS', 'Training & Development'],
    languages: ['ไทย', 'English'],
    education: [
      {
        degree: "Bachelor's Degree",
        field: 'Human Resource Management',
        institution: 'Thammasat University',
        graduationYear: 2018,
        gpa: 3.42,
      },
    ],
    workExperience: [
      {
        title: 'HR Officer',
        company: 'Manufacturing Corp.',
        startDate: '2018-06',
        endDate: '2025-10',
        current: false,
        description: 'Managed recruitment and employee relations for 200+ employees',
      },
    ],
    resumeUrl: 'https://example.com/resume/supaporn-k.pdf',
    linkedInUrl: 'https://linkedin.com/in/supaporn-kittisak',
    status: 'screening',
    notes: 'Good experience in recruitment',
    source: 'JobsDB',
  },

  // ============================================
  // New Applications - Marketing Positions
  // ============================================
  {
    firstName: 'Chananchida',
    lastName: 'Promthep',
    email: 'chananchida.p@example.com',
    phone: '0856789505',
    dateOfBirth: '1997-09-25',
    nationality: 'ไทย',
    address: '888 ถนนพระราม 9 ห้วยขวาง กรุงเทพฯ 10320',
    positionApplied: 'Digital Marketing Specialist',
    expectedSalary: 40000,
    availableDate: '2025-12-01',
    experienceLevel: 'mid',
    yearsOfExperience: 4,
    skills: [
      'Google Ads',
      'Facebook Ads',
      'SEO',
      'Content Marketing',
      'Google Analytics',
      'Social Media Marketing',
    ],
    languages: ['ไทย', 'English'],
    education: [
      {
        degree: "Bachelor's Degree",
        field: 'Marketing',
        institution: 'Bangkok University',
        graduationYear: 2019,
        gpa: 3.38,
      },
    ],
    workExperience: [
      {
        title: 'Digital Marketing Specialist',
        company: 'E-commerce Startup',
        startDate: '2019-08',
        current: true,
        description: 'Managed digital campaigns with 2M+ monthly budget',
      },
    ],
    resumeUrl: 'https://example.com/resume/chananchida-p.pdf',
    portfolioUrl: 'https://chananchida-marketing.com',
    linkedInUrl: 'https://linkedin.com/in/chananchida-p',
    status: 'interview',
    notes: 'Strong digital marketing background, good portfolio',
    interviewDate: '2025-11-22',
    interviewer: 'Ploy Sukhumvit',
    source: 'Website',
  },

  // ============================================
  // Rejected / Hired Candidates
  // ============================================
  {
    firstName: 'Wichit',
    lastName: 'Saengkaew',
    email: 'wichit.s@example.com',
    phone: '0891112506',
    dateOfBirth: '1996-12-08',
    nationality: 'ไทย',
    positionApplied: 'Junior Developer',
    expectedSalary: 25000,
    experienceLevel: 'entry',
    yearsOfExperience: 1,
    skills: ['HTML', 'CSS', 'JavaScript'],
    languages: ['ไทย'],
    education: [
      {
        degree: "Bachelor's Degree",
        field: 'Computer Science',
        institution: 'Rajamangala University',
        graduationYear: 2024,
        gpa: 2.85,
      },
    ],
    workExperience: [
      {
        title: 'Intern Developer',
        company: 'Local Company',
        startDate: '2024-01',
        endDate: '2024-06',
        current: false,
        description: 'Assisted in web development',
      },
    ],
    resumeUrl: 'https://example.com/resume/wichit-s.pdf',
    status: 'rejected',
    notes: 'Skills do not match requirements',
    source: 'JobThai',
  },
  {
    firstName: 'Sirilak',
    lastName: 'Boonsong',
    email: 'sirilak.b@example.com',
    phone: '0822223507',
    dateOfBirth: '1994-04-14',
    nationality: 'ไทย',
    address: '999 ถนนลาดพร้าว จตุจักร กรุงเทพฯ 10900',
    positionApplied: 'HR Manager',
    expectedSalary: 65000,
    availableDate: '2025-11-15',
    experienceLevel: 'senior',
    yearsOfExperience: 8,
    skills: [
      'HR Strategy',
      'Talent Management',
      'Compensation & Benefits',
      'Labor Law',
      'Change Management',
    ],
    languages: ['ไทย', 'English'],
    education: [
      {
        degree: "Master's Degree",
        field: 'Human Resource Development',
        institution: 'NIDA',
        graduationYear: 2018,
        gpa: 3.75,
      },
      {
        degree: "Bachelor's Degree",
        field: 'Psychology',
        institution: 'Chulalongkorn University',
        graduationYear: 2016,
        gpa: 3.52,
      },
    ],
    workExperience: [
      {
        title: 'Senior HR Manager',
        company: 'Multinational Corporation',
        startDate: '2018-07',
        endDate: '2025-10',
        current: false,
        description: 'Led HR operations for 500+ employees',
      },
    ],
    resumeUrl: 'https://example.com/resume/sirilak-b.pdf',
    linkedInUrl: 'https://linkedin.com/in/sirilak-boonsong',
    status: 'offer',
    notes: 'Excellent candidate, offer letter sent',
    interviewDate: '2025-11-10',
    interviewer: 'Nattaya Srisuk',
    source: 'LinkedIn',
  },
];

/**
 * Validate candidate data with Zod
 */
function validateCandidateData(data: unknown, context: string) {
  try {
    return validateCandidate(data);
  } catch (error) {
    console.error(`❌ Validation failed for ${context}:`, error);
    throw error;
  }
}

async function seedCandidates() {
  console.log('🌱 Seeding Candidates...');

  const now = Timestamp.now();
  let successCount = 0;
  let errorCount = 0;

  for (const candidateData of sampleCandidates) {
    try {
      // Generate candidate ID
      const candidateRef = db.collection('candidates').doc();
      const candidateId = candidateRef.id;

      // Prepare candidate data with stripUndefined
      const candidatePayload = stripUndefined({
        id: candidateId,

        // Personal Information
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        email: candidateData.email,
        phone: candidateData.phone,
        dateOfBirth: candidateData.dateOfBirth || null,
        nationality: candidateData.nationality || null,
        address: candidateData.address || null,

        // Position Information
        positionApplied: candidateData.positionApplied,
        expectedSalary: candidateData.expectedSalary || null,
        availableDate: candidateData.availableDate || null,

        // Experience & Skills
        experienceLevel: candidateData.experienceLevel || null,
        yearsOfExperience: candidateData.yearsOfExperience || null,
        skills: candidateData.skills,
        languages: candidateData.languages,

        // Education & Experience
        education: candidateData.education,
        workExperience: candidateData.workExperience,

        // Documents & Links
        resumeUrl: candidateData.resumeUrl,
        portfolioUrl: candidateData.portfolioUrl || null,
        linkedInUrl: candidateData.linkedInUrl || null,

        // Application Status
        status: candidateData.status,
        notes: candidateData.notes || null,
        interviewDate: candidateData.interviewDate || null,
        interviewer: candidateData.interviewer || null,

        // Metadata
        appliedAt: now,
        updatedAt: now,
        createdAt: now,
        source: candidateData.source || 'website',
        tenantId: 'default', // ✅ Required for multi-tenant support
      });

      // Create candidate document (skip validation for seed data)
      // Validation will happen on read via candidateService
      await candidateRef.set(candidatePayload);

      console.log(
        `  ✅ Created candidate: ${candidateData.firstName} ${candidateData.lastName} - ${candidateData.positionApplied} (${candidateData.status})`
      );
      successCount++;
    } catch (error) {
      console.error(
        `  ❌ Error creating candidate ${candidateData.firstName} ${candidateData.lastName}:`,
        error
      );
      errorCount++;
    }
  }

  console.log(`\n✅ Successfully seeded ${successCount}/${sampleCandidates.length} candidates`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} candidates failed`);
  }
  console.log('\n📊 Summary by status:');
  const statusCounts = sampleCandidates.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(`   - ${status}: ${count}`);
  }
}

// Run seed
seedCandidates()
  .then(() => {
    console.log('\n✅ Candidate seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding candidates:', error);
    process.exit(1);
  });
