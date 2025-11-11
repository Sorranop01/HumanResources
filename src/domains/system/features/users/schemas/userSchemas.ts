import { z } from 'zod';
import { ROLES } from '@/shared/constants/roles';

/**
 * Schema for creating a new user
 */
export const CreateUserSchema = z.object({
  email: z.string().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  displayName: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล').max(100, 'ชื่อ-นามสกุลต้องไม่เกิน 100 ตัวอักษร'),
  role: z.enum([ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.AUDITOR], {
    required_error: 'กรุณาเลือกบทบาท',
  }),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{9,10}$/.test(val), 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก'),
});

export type CreateUserFormInput = z.infer<typeof CreateUserSchema>;
