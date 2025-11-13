import { z } from 'zod';

/**
 * Schema for starting a break
 */
export const startBreakSchema = z.object({
  recordId: z.string().min(1, 'Attendance record ID is required'),
  breakType: z.enum(['lunch', 'rest', 'prayer', 'other']),
  notes: z.string().optional(),
});

/**
 * Schema for ending a break
 */
export const endBreakSchema = z.object({
  recordId: z.string().min(1, 'Attendance record ID is required'),
  breakId: z.string().min(1, 'Break ID is required'),
});

export type StartBreakInput = z.infer<typeof startBreakSchema>;
export type EndBreakInput = z.infer<typeof endBreakSchema>;
