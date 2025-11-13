import type { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

/**
 * Common Zod Schemas
 * Shared validation schemas used across multiple domains
 * ✅ Single Source of Truth for common data types
 */

/**
 * Firestore Timestamp Schema
 * Validates Firebase Timestamp objects from both Admin SDK and Client SDK
 *
 * Supports three formats:
 * - Admin SDK: { _seconds, _nanoseconds }
 * - Client SDK: { seconds, nanoseconds }
 * - Timestamp object: has .toDate() method
 *
 * @example
 * ```typescript
 * import { FirestoreTimestampSchema } from '@/shared/schemas/common.schema';
 *
 * const UserSchema = z.object({
 *   id: z.string(),
 *   createdAt: FirestoreTimestampSchema,
 *   updatedAt: FirestoreTimestampSchema,
 * });
 * ```
 */
export const FirestoreTimestampSchema = z.custom<Timestamp>(
  (val) => {
    if (val && typeof val === 'object') {
      return (
        ('_seconds' in val && '_nanoseconds' in val) || // Admin SDK format
        ('seconds' in val && 'nanoseconds' in val) || // Client SDK format
        typeof (val as { toDate?: unknown }).toDate === 'function' // Timestamp instance
      );
    }
    return false;
  },
  { message: 'Expected Firebase Timestamp' }
);

/**
 * Tenant ID Schema
 * All multi-tenant collections must include this field
 */
export const TenantIdSchema = z.string().min(1, 'Tenant ID is required');

/**
 * Common metadata fields for Firestore documents
 * Use this for consistent audit trail across all collections
 *
 * @example
 * ```typescript
 * import { FirestoreMetadataSchema } from '@/shared/schemas/common.schema';
 *
 * const ArticleSchema = z.object({
 *   id: z.string(),
 *   title: z.string(),
 *   // ... other fields
 * }).merge(FirestoreMetadataSchema);
 * ```
 */
export const FirestoreMetadataSchema = z.object({
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  tenantId: TenantIdSchema,
});
