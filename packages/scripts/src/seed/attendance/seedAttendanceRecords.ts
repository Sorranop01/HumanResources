/**
 * Seed Attendance Records
 * Creates sample attendance records with breaks and penalties for testing
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 */

import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

// Mock data for denormalization
const MOCK_EMPLOYEES: Record<
  string,
  {
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    departmentId: string;
    departmentName: string;
    positionId: string;
    positionName: string;
  }
> = {
  'user-emp-001': {
    employeeId: 'emp-001',
    employeeName: 'Thanawat Jitpakdee',
    employeeCode: 'EMP006',
    departmentId: 'dept-it',
    departmentName: 'ฝ่ายเทคโนโลยีสารสนเทศ',
    positionId: 'pos-senior-dev',
    positionName: 'Senior Developer',
  },
  'user-emp-002': {
    employeeId: 'emp-002',
    employeeName: 'Siriporn Rattanaporn',
    employeeCode: 'EMP007',
    departmentId: 'dept-it',
    departmentName: 'ฝ่ายเทคโนโลยีสารสนเทศ',
    positionId: 'pos-mid-dev',
    positionName: 'Mid-Level Developer',
  },
  'user-emp-003': {
    employeeId: 'emp-003',
    employeeName: 'Nattawut Kaewsri',
    employeeCode: 'EMP008',
    departmentId: 'dept-it',
    departmentName: 'ฝ่ายเทคโนโลยีสารสนเทศ',
    positionId: 'pos-junior-dev',
    positionName: 'Junior Developer',
  },
  'user-emp-004': {
    employeeId: 'emp-004',
    employeeName: 'Ploy Sukhumvit',
    employeeCode: 'EMP009',
    departmentId: 'dept-marketing',
    departmentName: 'ฝ่ายการตลาด',
    positionId: 'pos-marketing-manager',
    positionName: 'Marketing Manager',
  },
};

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: FirebaseFirestore.Timestamp;
  isWithinGeofence?: boolean;
  distanceFromOffice?: number;
  address?: string;
}

interface BreakRecord {
  id: string;
  breakType: 'lunch' | 'rest' | 'prayer' | 'other';
  startTime: FirebaseFirestore.Timestamp;
  endTime: FirebaseFirestore.Timestamp | null;
  duration: number | null;
  scheduledDuration: number;
  isPaid: boolean;
}

interface AttendancePenalty {
  policyId: string;
  type: 'late' | 'early-leave' | 'absence' | 'no-clock-out';
  amount: number;
  description: string;
}

interface AttendanceRecord {
  id: string;
  userId: string;
  employeeId?: string;
  employeeName: string;
  employeeCode: string;
  departmentId?: string;
  departmentName: string;
  positionId?: string;
  positionName: string;
  clockInTime: FirebaseFirestore.Timestamp;
  clockOutTime: FirebaseFirestore.Timestamp | null;
  status: 'clocked-in' | 'clocked-out';
  date: string; // YYYY-MM-DD

  // Schedule reference
  workSchedulePolicyId?: string;
  shiftAssignmentId?: string;
  scheduledStartTime: string;
  scheduledEndTime: string;

  // Duration
  durationHours: number | null;

  // Late tracking
  isLate: boolean;
  minutesLate: number;
  lateReason?: string;
  isExcusedLate: boolean;
  lateApprovedBy?: string;

  // Early leave tracking
  isEarlyLeave: boolean;
  minutesEarly: number;
  earlyLeaveReason?: string;
  isApprovedEarlyLeave: boolean;
  earlyLeaveApprovedBy?: string;

  // Break tracking
  breaks: BreakRecord[];
  totalBreakMinutes: number;
  unpaidBreakMinutes: number;

  // Location tracking
  clockInLocation?: LocationData;
  clockOutLocation?: LocationData;
  isRemoteWork: boolean;

  // Clock-in method
  clockInMethod: 'mobile' | 'web' | 'biometric' | 'manual';
  clockOutMethod?: 'mobile' | 'web' | 'biometric' | 'manual';
  ipAddress?: string;
  deviceId?: string;

  // Validation & approval
  requiresApproval: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: FirebaseFirestore.Timestamp;
  approvalNotes?: string;

  // Penalties
  penaltiesApplied: AttendancePenalty[];

  // Shift premium
  shiftPremiumRate?: number;
  shiftBonus?: number;

  // Flags
  isMissedClockOut: boolean;
  isManualEntry: boolean;
  isCorrected: boolean;

  // Notes
  notes?: string;
}

// Helper to create date
function createDate(daysAgo: number, hours: number, minutes: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Sample attendance records
function createAttendanceRecords(): Omit<AttendanceRecord, 'id'>[] {
  const records: Omit<AttendanceRecord, 'id'>[] = [];

  // Record 1: Perfect attendance (today - 5 days ago)
  const date1 = createDate(5, 8, 55); // Clock in at 08:55
  const clockOut1 = new Date(date1.getTime() + 9 * 60 * 60 * 1000 + 5 * 60 * 1000); // 9h 5min later
  const employee1 = MOCK_EMPLOYEES['user-emp-001'];

  records.push({
    userId: 'user-emp-001',
    employeeId: employee1.employeeId,
    employeeName: employee1.employeeName,
    employeeCode: employee1.employeeCode,
    departmentId: employee1.departmentId,
    departmentName: employee1.departmentName,
    positionId: employee1.positionId,
    positionName: employee1.positionName,
    clockInTime: Timestamp.fromDate(date1),
    clockOutTime: Timestamp.fromDate(clockOut1),
    status: 'clocked-out',
    date: formatDate(date1),
    scheduledStartTime: '09:00',
    scheduledEndTime: '18:00',
    durationHours: 8.08, // 9h 5min - 1h break
    isLate: false,
    minutesLate: 0,
    isExcusedLate: false,
    isEarlyLeave: false,
    minutesEarly: 0,
    isApprovedEarlyLeave: false,
    breaks: [
      {
        id: 'break_1',
        breakType: 'lunch',
        startTime: Timestamp.fromDate(new Date(date1.getTime() + 4 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(date1.getTime() + 5 * 60 * 60 * 1000)),
        duration: 60,
        scheduledDuration: 60,
        isPaid: false,
      },
    ],
    totalBreakMinutes: 60,
    unpaidBreakMinutes: 60,
    clockInLocation: {
      latitude: 13.7563,
      longitude: 100.5018,
      accuracy: 10,
      timestamp: Timestamp.fromDate(date1),
      isWithinGeofence: true,
      distanceFromOffice: 50,
    },
    clockOutLocation: {
      latitude: 13.7565,
      longitude: 100.502,
      accuracy: 15,
      timestamp: Timestamp.fromDate(clockOut1),
      isWithinGeofence: true,
      distanceFromOffice: 60,
    },
    isRemoteWork: false,
    clockInMethod: 'web',
    clockOutMethod: 'web',
    requiresApproval: false,
    penaltiesApplied: [],
    isMissedClockOut: false,
    isManualEntry: false,
    isCorrected: false,
  });

  // Record 2: Late arrival with penalty (today - 4 days ago)
  const date2 = createDate(4, 9, 20); // Clock in at 09:20 (20 min late)
  const clockOut2 = new Date(date2.getTime() + 8 * 60 * 60 * 1000 + 40 * 60 * 1000);
  const employee2 = MOCK_EMPLOYEES['user-emp-002'];

  records.push({
    userId: 'user-emp-002',
    employeeId: employee2.employeeId,
    employeeName: employee2.employeeName,
    employeeCode: employee2.employeeCode,
    departmentId: employee2.departmentId,
    departmentName: employee2.departmentName,
    positionId: employee2.positionId,
    positionName: employee2.positionName,
    clockInTime: Timestamp.fromDate(date2),
    clockOutTime: Timestamp.fromDate(clockOut2),
    status: 'clocked-out',
    date: formatDate(date2),
    scheduledStartTime: '09:00',
    scheduledEndTime: '18:00',
    durationHours: 7.67, // 8h 40min - 1h break
    isLate: true,
    minutesLate: 20,
    lateReason: 'รถติด',
    isExcusedLate: false,
    isEarlyLeave: false,
    minutesEarly: 0,
    isApprovedEarlyLeave: false,
    breaks: [
      {
        id: 'break_2',
        breakType: 'lunch',
        startTime: Timestamp.fromDate(new Date(date2.getTime() + 4 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(date2.getTime() + 5 * 60 * 60 * 1000)),
        duration: 60,
        scheduledDuration: 60,
        isPaid: false,
      },
    ],
    totalBreakMinutes: 60,
    unpaidBreakMinutes: 60,
    clockInLocation: {
      latitude: 13.7563,
      longitude: 100.5018,
      accuracy: 20,
      timestamp: Timestamp.fromDate(date2),
      isWithinGeofence: true,
      distanceFromOffice: 100,
    },
    clockOutLocation: {
      latitude: 13.7563,
      longitude: 100.5018,
      accuracy: 15,
      timestamp: Timestamp.fromDate(clockOut2),
      isWithinGeofence: true,
      distanceFromOffice: 80,
    },
    isRemoteWork: false,
    clockInMethod: 'web',
    clockOutMethod: 'web',
    requiresApproval: true,
    approvalStatus: 'pending',
    penaltiesApplied: [
      {
        policyId: 'penalty-late-fixed',
        type: 'late',
        amount: 100,
        description: 'สายงาน 20 นาที - ค่าปรับมาสาย (อัตราคงที่)',
      },
    ],
    isMissedClockOut: false,
    isManualEntry: false,
    isCorrected: false,
    notes: 'พนักงานแจ้งว่ารถติด',
  });

  // Record 3: Early leave (today - 3 days ago)
  const date3 = createDate(3, 8, 58);
  const clockOut3 = new Date(date3.getTime() + 7 * 60 * 60 * 1000 + 30 * 60 * 1000); // Left 1.5h early
  const employee3 = MOCK_EMPLOYEES['user-emp-003'];

  records.push({
    userId: 'user-emp-003',
    employeeId: employee3.employeeId,
    employeeName: employee3.employeeName,
    employeeCode: employee3.employeeCode,
    departmentId: employee3.departmentId,
    departmentName: employee3.departmentName,
    positionId: employee3.positionId,
    positionName: employee3.positionName,
    clockInTime: Timestamp.fromDate(date3),
    clockOutTime: Timestamp.fromDate(clockOut3),
    status: 'clocked-out',
    date: formatDate(date3),
    scheduledStartTime: '09:00',
    scheduledEndTime: '18:00',
    durationHours: 6.5, // 7.5h - 1h break
    isLate: false,
    minutesLate: 0,
    isExcusedLate: false,
    isEarlyLeave: true,
    minutesEarly: 90,
    earlyLeaveReason: 'ไปรับลูกที่โรงเรียน',
    isApprovedEarlyLeave: false,
    breaks: [
      {
        id: 'break_3',
        breakType: 'lunch',
        startTime: Timestamp.fromDate(new Date(date3.getTime() + 4 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(date3.getTime() + 5 * 60 * 60 * 1000)),
        duration: 60,
        scheduledDuration: 60,
        isPaid: false,
      },
    ],
    totalBreakMinutes: 60,
    unpaidBreakMinutes: 60,
    clockInLocation: {
      latitude: 13.7563,
      longitude: 100.5018,
      accuracy: 12,
      timestamp: Timestamp.fromDate(date3),
      isWithinGeofence: true,
      distanceFromOffice: 45,
    },
    clockOutLocation: {
      latitude: 13.7563,
      longitude: 100.5018,
      accuracy: 10,
      timestamp: Timestamp.fromDate(clockOut3),
      isWithinGeofence: true,
      distanceFromOffice: 50,
    },
    isRemoteWork: false,
    clockInMethod: 'web',
    clockOutMethod: 'web',
    requiresApproval: true,
    approvalStatus: 'pending',
    penaltiesApplied: [
      {
        policyId: 'penalty-early-leave',
        type: 'early-leave',
        amount: 150,
        description: 'ออกงานก่อนเวลา 90 นาที - ค่าปรับออกก่อนเวลา',
      },
    ],
    isMissedClockOut: false,
    isManualEntry: false,
    isCorrected: false,
    notes: 'ต้องไปรับลูกฉุกเฉิน',
  });

  // Record 4: Multiple breaks (today - 2 days ago)
  const date4 = createDate(2, 9, 0);
  const clockOut4 = new Date(date4.getTime() + 9 * 60 * 60 * 1000);
  const employee4 = MOCK_EMPLOYEES['user-emp-001'];

  records.push({
    userId: 'user-emp-001',
    employeeId: employee4.employeeId,
    employeeName: employee4.employeeName,
    employeeCode: employee4.employeeCode,
    departmentId: employee4.departmentId,
    departmentName: employee4.departmentName,
    positionId: employee4.positionId,
    positionName: employee4.positionName,
    clockInTime: Timestamp.fromDate(date4),
    clockOutTime: Timestamp.fromDate(clockOut4),
    status: 'clocked-out',
    date: formatDate(date4),
    scheduledStartTime: '09:00',
    scheduledEndTime: '18:00',
    durationHours: 7.75, // 9h - 1h 15min breaks
    isLate: false,
    minutesLate: 0,
    isExcusedLate: false,
    isEarlyLeave: false,
    minutesEarly: 0,
    isApprovedEarlyLeave: false,
    breaks: [
      {
        id: 'break_4a',
        breakType: 'rest',
        startTime: Timestamp.fromDate(new Date(date4.getTime() + 2 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(
          new Date(date4.getTime() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000)
        ),
        duration: 15,
        scheduledDuration: 15,
        isPaid: true,
      },
      {
        id: 'break_4b',
        breakType: 'lunch',
        startTime: Timestamp.fromDate(new Date(date4.getTime() + 4 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(date4.getTime() + 5 * 60 * 60 * 1000)),
        duration: 60,
        scheduledDuration: 60,
        isPaid: false,
      },
    ],
    totalBreakMinutes: 75,
    unpaidBreakMinutes: 60,
    clockInLocation: {
      latitude: 13.7563,
      longitude: 100.5018,
      accuracy: 8,
      timestamp: Timestamp.fromDate(date4),
      isWithinGeofence: true,
      distanceFromOffice: 40,
    },
    clockOutLocation: {
      latitude: 13.7563,
      longitude: 100.5018,
      accuracy: 10,
      timestamp: Timestamp.fromDate(clockOut4),
      isWithinGeofence: true,
      distanceFromOffice: 45,
    },
    isRemoteWork: false,
    clockInMethod: 'web',
    clockOutMethod: 'web',
    requiresApproval: false,
    penaltiesApplied: [],
    isMissedClockOut: false,
    isManualEntry: false,
    isCorrected: false,
  });

  // Record 5: Remote work (today - 1 day ago)
  const date5 = createDate(1, 9, 5);
  const clockOut5 = new Date(date5.getTime() + 8 * 60 * 60 * 1000 + 30 * 60 * 1000);
  const employee5 = MOCK_EMPLOYEES['user-emp-004'];

  records.push({
    userId: 'user-emp-004',
    employeeId: employee5.employeeId,
    employeeName: employee5.employeeName,
    employeeCode: employee5.employeeCode,
    departmentId: employee5.departmentId,
    departmentName: employee5.departmentName,
    positionId: employee5.positionId,
    positionName: employee5.positionName,
    clockInTime: Timestamp.fromDate(date5),
    clockOutTime: Timestamp.fromDate(clockOut5),
    status: 'clocked-out',
    date: formatDate(date5),
    scheduledStartTime: '09:00',
    scheduledEndTime: '18:00',
    durationHours: 7.5, // 8.5h - 1h break
    isLate: false,
    minutesLate: 0,
    isExcusedLate: false,
    isEarlyLeave: false,
    minutesEarly: 0,
    isApprovedEarlyLeave: false,
    breaks: [
      {
        id: 'break_5',
        breakType: 'lunch',
        startTime: Timestamp.fromDate(new Date(date5.getTime() + 4 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(date5.getTime() + 5 * 60 * 60 * 1000)),
        duration: 60,
        scheduledDuration: 60,
        isPaid: false,
      },
    ],
    totalBreakMinutes: 60,
    unpaidBreakMinutes: 60,
    clockInLocation: {
      latitude: 13.8,
      longitude: 100.6,
      accuracy: 50,
      timestamp: Timestamp.fromDate(date5),
      isWithinGeofence: false, // Outside geofence (remote work)
      distanceFromOffice: 15000, // 15km away
    },
    clockOutLocation: {
      latitude: 13.8,
      longitude: 100.6,
      accuracy: 45,
      timestamp: Timestamp.fromDate(clockOut5),
      isWithinGeofence: false,
      distanceFromOffice: 15000,
    },
    isRemoteWork: true,
    clockInMethod: 'web',
    clockOutMethod: 'web',
    ipAddress: '192.168.1.100',
    requiresApproval: false,
    penaltiesApplied: [],
    isMissedClockOut: false,
    isManualEntry: false,
    isCorrected: false,
    notes: 'ทำงานจากบ้าน',
  });

  // Record 6: Currently clocked in (today)
  const date6 = createDate(0, 8, 57);
  const employee6 = MOCK_EMPLOYEES['user-emp-001'];

  records.push({
    userId: 'user-emp-001',
    employeeId: employee6.employeeId,
    employeeName: employee6.employeeName,
    employeeCode: employee6.employeeCode,
    departmentId: employee6.departmentId,
    departmentName: employee6.departmentName,
    positionId: employee6.positionId,
    positionName: employee6.positionName,
    clockInTime: Timestamp.fromDate(date6),
    clockOutTime: null,
    status: 'clocked-in',
    date: formatDate(date6),
    scheduledStartTime: '09:00',
    scheduledEndTime: '18:00',
    durationHours: null,
    isLate: false,
    minutesLate: 0,
    isExcusedLate: false,
    isEarlyLeave: false,
    minutesEarly: 0,
    isApprovedEarlyLeave: false,
    breaks: [],
    totalBreakMinutes: 0,
    unpaidBreakMinutes: 0,
    clockInLocation: {
      latitude: 13.7563,
      longitude: 100.5018,
      accuracy: 10,
      timestamp: Timestamp.fromDate(date6),
      isWithinGeofence: true,
      distanceFromOffice: 50,
    },
    isRemoteWork: false,
    clockInMethod: 'web',
    requiresApproval: false,
    penaltiesApplied: [],
    isMissedClockOut: false,
    isManualEntry: false,
    isCorrected: false,
  });

  return records;
}

export async function seedAttendanceRecords() {
  console.log('📊 Seeding attendance records...');

  const records = createAttendanceRecords();
  const batch = db.batch();

  for (const record of records) {
    // Generate a unique ID based on userId and date
    const docId = `attendance_${record.userId}_${record.date}`;
    const docRef = db.collection('attendance').doc(docId);

    // ✅ Use stripUndefined for Firestore safety
    const attendancePayload = stripUndefined({
      id: docId,
      ...record,
      tenantId: 'default', // ✅ Ensure tenantId is present
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    batch.set(docRef, attendancePayload);
    console.log(`  ✓ Created attendance: ${record.userId} on ${record.date} (${record.status})`);
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${records.length} attendance records`);
}

// Run seed
seedAttendanceRecords()
  .then(() => {
    console.log('✅ Attendance record seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding attendance records:', error);
    process.exit(1);
  });
