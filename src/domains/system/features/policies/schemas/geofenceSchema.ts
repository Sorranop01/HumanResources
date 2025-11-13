import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

/**
 * Geofence Config Schema
 */
export const geofenceConfigSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),

  // Location
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().min(10).max(10000),

  // Address
  address: z.string().max(500).optional(),

  // Validation settings
  isActive: z.boolean().default(true),
  enforceForClockIn: z.boolean().default(true),
  enforceForClockOut: z.boolean().default(false),
  allowedDepartments: z.array(z.string()).optional(),
  allowedEmploymentTypes: z.array(z.string()).optional(),

  // Metadata
  createdBy: z.string().min(1),
  createdAt: z.instanceof(Timestamp),
  updatedBy: z.string().optional(),
  updatedAt: z.instanceof(Timestamp).optional(),
});

export type GeofenceConfigInput = z.infer<typeof geofenceConfigSchema>;

/**
 * Geofence Create Schema (for forms)
 */
export const createGeofenceSchema = z.object({
  name: z.string().min(1, 'ชื่อจุดตรวจสอบต้องไม่ว่าง').max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  description: z.string().max(500, 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร').optional(),
  latitude: z.number().min(-90, 'Latitude ต้องอยู่ระหว่าง -90 ถึง 90').max(90),
  longitude: z.number().min(-180, 'Longitude ต้องอยู่ระหว่าง -180 ถึง 180').max(180),
  radiusMeters: z.number().min(10, 'รัศมีต้องมากกว่า 10 เมตร').max(10000, 'รัศมีต้องไม่เกิน 10,000 เมตร'),
  address: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  enforceForClockIn: z.boolean().default(true),
  enforceForClockOut: z.boolean().default(false),
  allowedDepartments: z.array(z.string()).optional(),
  allowedEmploymentTypes: z.array(z.string()).optional(),
});

export type CreateGeofenceInput = z.infer<typeof createGeofenceSchema>;

/**
 * Geofence Update Schema
 */
export const updateGeofenceSchema = createGeofenceSchema.partial();

export type UpdateGeofenceInput = z.infer<typeof updateGeofenceSchema>;
