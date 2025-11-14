/**
 * Permission Constants
 * Defines all permission types in the RBAC system
 */

export const PERMISSIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Permission Labels (Thai)
 */
export const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.READ]: 'อ่าน',
  [PERMISSIONS.CREATE]: 'สร้าง',
  [PERMISSIONS.UPDATE]: 'แก้ไข',
  [PERMISSIONS.DELETE]: 'ลบ',
};

/**
 * Permission Descriptions (Thai)
 */
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  [PERMISSIONS.READ]: 'ดูข้อมูล',
  [PERMISSIONS.CREATE]: 'สร้างข้อมูลใหม่',
  [PERMISSIONS.UPDATE]: 'แก้ไขข้อมูลที่มีอยู่',
  [PERMISSIONS.DELETE]: 'ลบข้อมูล',
};

/**
 * Permission Icons (Ant Design icons)
 */
export const PERMISSION_ICONS: Record<Permission, string> = {
  [PERMISSIONS.READ]: 'EyeOutlined',
  [PERMISSIONS.CREATE]: 'PlusOutlined',
  [PERMISSIONS.UPDATE]: 'EditOutlined',
  [PERMISSIONS.DELETE]: 'DeleteOutlined',
};

/**
 * Permission Colors (for tags)
 */
export const PERMISSION_COLORS: Record<Permission, string> = {
  [PERMISSIONS.READ]: 'blue',
  [PERMISSIONS.CREATE]: 'green',
  [PERMISSIONS.UPDATE]: 'orange',
  [PERMISSIONS.DELETE]: 'red',
};
