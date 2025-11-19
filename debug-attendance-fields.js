// Debug script to check which fields are missing in attendance creation

const requiredFields = [
  'userId',
  'employeeName',
  'departmentName',
  'clockInTime',
  'status',
  'date',
  'scheduledStartTime',
  'scheduledEndTime',
  'isLate',
  'minutesLate',
  'isExcusedLate',
  'isEarlyLeave',
  'minutesEarly',
  'isApprovedEarlyLeave',
  'breaks',
  'totalBreakMinutes',
  'unpaidBreakMinutes',
  'isRemoteWork',
  'clockInMethod',
  'requiresApproval',
  'penaltiesApplied',
  'isMissedClockOut',
  'isManualEntry',
  'isCorrected',
  'tenantId',
  'createdAt',
  'updatedAt',
];

const providedFields = [
  'userId',
  'employeeId', // This is NOT in required fields!
  'clockInTime',
  'clockOutTime',
  'status',
  'date',
  'durationHours',
  'employeeName',
  'departmentName',
  'scheduledStartTime',
  'scheduledEndTime',
  'isLate',
  'minutesLate',
  'isExcusedLate',
  'isEarlyLeave',
  'minutesEarly',
  'isApprovedEarlyLeave',
  'breaks',
  'totalBreakMinutes',
  'unpaidBreakMinutes',
  'isRemoteWork',
  'clockInMethod',
  'requiresApproval',
  'penaltiesApplied',
  'isMissedClockOut',
  'isManualEntry',
  'isCorrected',
  'tenantId',
  'createdAt',
  'updatedAt',
];

const missingFields = requiredFields.filter((field) => !providedFields.includes(field));
const extraFields = providedFields.filter((field) => !requiredFields.includes(field));

console.log('Missing Required Fields:', missingFields);
console.log('Extra Fields (not required):', extraFields);
