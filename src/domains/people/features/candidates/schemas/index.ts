import type { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// Base Schemas
export const CandidateStatusSchema = z.enum([
  'new',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
]);

/**
 * Schema for the Candidate object stored in Firestore.
 */
export const CandidateSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, 'ชื่อต้องไม่ว่าง'),
  lastName: z.string().min(1, 'นามสกุลต้องไม่ว่าง'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  phone: z.string().min(9, 'เบอร์โทรศัพท์ไม่ถูกต้อง'),
  positionApplied: z.string().min(1, 'กรุณาระบุตำแหน่งที่สมัคร'),
  status: CandidateStatusSchema,
  resumeUrl: z.string().url('URL ของเรซูเม่ไม่ถูกต้อง').nullable(),
  notes: z.string().optional(),
  appliedAt: z.custom<Timestamp>(),
  updatedAt: z.custom<Timestamp>(),
});

/**
 * Schema for the candidate form.
 */
export const CandidateFormSchema = z.object({
  firstName: z.string().min(1, 'ชื่อต้องไม่ว่าง'),
  lastName: z.string().min(1, 'นามสกุลต้องไม่ว่าง'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  phone: z.string().min(9, 'เบอร์โทรศัพท์ไม่ถูกต้อง'),
  positionApplied: z.string().min(1, 'กรุณาระบุตำแหน่งที่สมัคร'),
  status: CandidateStatusSchema.default('new'),
  resumeUrl: z.string().url('URL ของเรซูเม่ไม่ถูกต้อง').or(z.literal('')).nullable(),
  notes: z.string().optional(),
});

// Inferred Types
export type Candidate = z.infer<typeof CandidateSchema>;
export type CandidateFormInput = z.infer<typeof CandidateFormSchema>;
export type CandidateStatus = z.infer<typeof CandidateStatusSchema>;
