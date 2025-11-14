/**
 * Resource Constants
 * Defines all resources in the RBAC system
 */

export const RESOURCES = {
  EMPLOYEES: 'employees',
  ATTENDANCE: 'attendance',
  LEAVE_REQUESTS: 'leave-requests',
  PAYROLL: 'payroll',
  SETTINGS: 'settings',
  USERS: 'users',
  ROLES: 'roles',
  AUDIT_LOGS: 'audit-logs',
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];

/**
 * Resource Labels (Thai)
 */
export const RESOURCE_LABELS: Record<Resource, string> = {
  [RESOURCES.EMPLOYEES]: 'พนักงาน',
  [RESOURCES.ATTENDANCE]: 'การเข้างาน',
  [RESOURCES.LEAVE_REQUESTS]: 'การลา',
  [RESOURCES.PAYROLL]: 'เงินเดือน',
  [RESOURCES.SETTINGS]: 'การตั้งค่า',
  [RESOURCES.USERS]: 'ผู้ใช้งาน',
  [RESOURCES.ROLES]: 'บทบาท',
  [RESOURCES.AUDIT_LOGS]: 'บันทึกการตรวจสอบ',
};

/**
 * Resource Descriptions (Thai)
 */
export const RESOURCE_DESCRIPTIONS: Record<Resource, string> = {
  [RESOURCES.EMPLOYEES]: 'จัดการข้อมูลพนักงาน',
  [RESOURCES.ATTENDANCE]: 'จัดการการเข้างานและเวลาทำงาน',
  [RESOURCES.LEAVE_REQUESTS]: 'จัดการคำขอลาและการอนุมัติ',
  [RESOURCES.PAYROLL]: 'จัดการเงินเดือนและค่าจ้าง',
  [RESOURCES.SETTINGS]: 'จัดการการตั้งค่าระบบ',
  [RESOURCES.USERS]: 'จัดการผู้ใช้งานและบัญชี',
  [RESOURCES.ROLES]: 'จัดการบทบาทและสิทธิ์',
  [RESOURCES.AUDIT_LOGS]: 'ดูบันทึกการเปลี่ยนแปลงในระบบ',
};
