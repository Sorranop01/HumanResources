import { z } from 'zod';

export const LocationTypeSchema = z.enum([
  'headquarters',
  'branch',
  'warehouse',
  'remote',
  'coworking',
  'client-site',
]);

export const LocationAddressSchema = z.object({
  addressLine1: z.string().min(1, 'ที่อยู่บรรทัดที่ 1 จำเป็นต้องระบุ'),
  addressLine2: z.string().optional(),
  subDistrict: z.string().min(1, 'ตำบล/แขวง จำเป็นต้องระบุ'),
  district: z.string().min(1, 'อำเภอ/เขต จำเป็นต้องระบุ'),
  province: z.string().min(1, 'จังหวัด จำเป็นต้องระบุ'),
  postalCode: z.string().regex(/^\d{5}$/, 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'),
  country: z.string().default('Thailand'),
});

export const LocationCoordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Latitude ต้องอยู่ระหว่าง -90 ถึง 90')
    .max(90, 'Latitude ต้องอยู่ระหว่าง -90 ถึง 90'),
  longitude: z
    .number()
    .min(-180, 'Longitude ต้องอยู่ระหว่าง -180 ถึง 180')
    .max(180, 'Longitude ต้องอยู่ระหว่าง -180 ถึง 180'),
});

export const CreateLocationSchema = z.object({
  code: z
    .string()
    .min(2, 'รหัสสถานที่ต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(20, 'รหัสสถานที่ต้องไม่เกิน 20 ตัวอักษร')
    .regex(/^[A-Z0-9-]+$/, 'รหัสสถานที่ต้องเป็นตัวพิมพ์ใหญ่และตัวเลข')
    .toUpperCase(),
  name: z.string().min(2, 'ชื่อสถานที่ต้องมีอย่างน้อย 2 ตัวอักษร').max(100, 'ชื่อสถานที่ต้องไม่เกิน 100 ตัวอักษร'),
  nameEn: z
    .string()
    .min(2, 'Location name must be at least 2 characters')
    .max(100, 'Location name must not exceed 100 characters'),
  type: LocationTypeSchema,
  address: LocationAddressSchema,
  coordinates: LocationCoordinatesSchema.optional(),
  geofenceRadius: z
    .number()
    .min(10, 'รัศมี Geofence ต้องอย่างน้อย 10 เมตร')
    .max(5000, 'รัศมี Geofence ต้องไม่เกิน 5000 เมตร')
    .optional()
    .or(z.nan()),
  timezone: z.string().default('Asia/Bangkok'),
  phone: z
    .string()
    .regex(/^(\+66|0)[0-9]{8,9}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
  email: z.string().email('อีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  capacity: z.number().int().min(1, 'ความจุต้องมากกว่า 0').optional().or(z.nan()),
  currentEmployeeCount: z.number().int().min(0).optional().or(z.nan()),
  isActive: z.boolean().default(true),
  supportsRemoteWork: z.boolean().default(false),
  tenantId: z.string().min(1, 'Tenant ID จำเป็นต้องระบุ'),
});

export const UpdateLocationSchema = CreateLocationSchema.partial().omit({
  tenantId: true,
});

export type CreateLocationFormInput = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationFormInput = z.infer<typeof UpdateLocationSchema>;
