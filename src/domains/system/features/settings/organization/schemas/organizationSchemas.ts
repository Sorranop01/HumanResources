import { z } from 'zod';

/**
 * Address schema
 */
export const OrganizationAddressSchema = z.object({
  addressLine1: z.string().min(1, 'ที่อยู่บรรทัดที่ 1 จำเป็นต้องระบุ'),
  addressLine2: z.string().optional(),
  subDistrict: z.string().min(1, 'ตำบล/แขวง จำเป็นต้องระบุ'),
  district: z.string().min(1, 'อำเภอ/เขต จำเป็นต้องระบุ'),
  province: z.string().min(1, 'จังหวัด จำเป็นต้องระบุ'),
  postalCode: z.string().regex(/^\d{5}$/, 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'),
  country: z.string().default('Thailand'),
});

/**
 * Create organization schema
 */
export const CreateOrganizationSchema = z.object({
  companyName: z.string().min(2, 'ชื่อบริษัทต้องมีอย่างน้อย 2 ตัวอักษร'),
  companyNameEn: z.string().min(2, 'Company name must be at least 2 characters'),
  registrationNumber: z
    .string()
    .min(10, 'เลขทะเบียนนิติบุคคลต้องมีอย่างน้อย 10 หลัก')
    .max(13, 'เลขทะเบียนนิติบุคคลต้องไม่เกิน 13 หลัก'),
  taxNumber: z.string().regex(/^\d{13}$/, 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก'),

  // Address
  address: OrganizationAddressSchema,

  // Contact
  phone: z.string().regex(/^(\+66|0)[0-9]{8,9}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง (เช่น 0812345678)'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  website: z.string().url('URL เว็บไซต์ไม่ถูกต้อง').optional().or(z.literal('')),

  // Branding
  logoUrl: z.string().url('Logo URL ไม่ถูกต้อง').optional().or(z.literal('')),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'สีหลักต้องเป็น HEX code เช่น #FF5733')
    .optional()
    .or(z.literal('')),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'สีรองต้องเป็น HEX code เช่น #00AAFF')
    .optional()
    .or(z.literal('')),

  // Financial
  currency: z.string().length(3, 'สกุลเงินต้องเป็นรหัส 3 ตัวอักษร เช่น THB'),
  fiscalYearStart: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
      'วันเริ่มปีงบประมาณต้องเป็นรูปแบบ MM-DD เช่น 01-01'
    ),

  // Settings
  timezone: z.string().min(1, 'เขตเวลาจำเป็นต้องระบุ'),
  defaultLanguage: z.enum(['th', 'en'], {
    errorMap: () => ({ message: 'ภาษาเริ่มต้นต้องเป็น th หรือ en' }),
  }),
});

/**
 * Update organization schema (all fields optional except constraints)
 */
export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

/**
 * Inferred types
 */
export type CreateOrganizationFormInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationFormInput = z.infer<typeof UpdateOrganizationSchema>;
