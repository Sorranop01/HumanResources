/**
 * Role Validation Schemas (Zod)
 * For validating role creation and updates
 */

import { z } from 'zod';

/**
 * Role key validation
 * - lowercase letters, numbers, underscores only
 * - must start with letter
 * - 3-50 characters
 */
export const roleKeySchema = z
  .string()
  .min(3, 'Role key must be at least 3 characters')
  .max(50, 'Role key must be at most 50 characters')
  .regex(
    /^[a-z][a-z0-9_]*$/,
    'Role key must start with a letter and contain only lowercase letters, numbers, and underscores'
  );

/**
 * Role name validation (Thai or English)
 */
export const roleNameSchema = z
  .string()
  .min(2, 'Role name must be at least 2 characters')
  .max(100, 'Role name must be at most 100 characters');

/**
 * Role description validation
 */
export const roleDescriptionSchema = z
  .string()
  .min(10, 'Description must be at least 10 characters')
  .max(500, 'Description must be at most 500 characters');

/**
 * Create Role Schema
 */
export const CreateRoleSchema = z.object({
  role: roleKeySchema,
  name: roleNameSchema,
  description: roleDescriptionSchema,
});

/**
 * Update Role Schema
 */
export const UpdateRoleSchema = z
  .object({
    name: roleNameSchema.optional(),
    description: roleDescriptionSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
