import type { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

/**
 * Common Zod Schemas for Firebase Functions
 * Shared validation schemas used across multiple domains
 * ✅ Single Source of Truth for common data types (Functions version)
 */

/**
 * Universal Timestamp Validator (Zod Schema) for Firebase Admin SDK
 * This is the SSOT for all timestamp validation in Cloud Functions.
 *
 * Correctly handles:
 * 1. JS Date objects
 * 2. Firebase Admin SDK Timestamps ({ _seconds, _nanoseconds })
 * 3. FieldValue.serverTimestamp() (sentinel value for writes)
 *
 * @example
 * ```typescript
 * import { FirestoreTimestampSchema } from './schemas/common.schema.js';
 *
 * const UserSchema = z.object({
 *   id: z.string(),
 *   createdAt: FirestoreTimestampSchema,
 *   updatedAt: FirestoreTimestampSchema,
 * });
 * ```
 */
export const FirestoreTimestampSchema = z.custom<Timestamp | Date>(
  (val) => {
    // ✅ 1. Check Date first (most common after conversion)
    if (val instanceof Date) {
      return true;
    }

    // ✅ 2. Check Timestamp formats (for raw Firestore data)
    if (val && typeof val === 'object') {
      return (
        // Admin SDK Timestamp ({ _seconds, _nanoseconds })
        ('_seconds' in val && '_nanoseconds' in val) ||
        // Client SDK Timestamp ({ seconds, nanoseconds }) - for compatibility
        ('seconds' in val && 'nanoseconds' in val) ||
        // Timestamp instance (has toDate method)
        typeof (val as { toDate?: unknown }).toDate === 'function' ||
        // FieldValue.serverTimestamp() (sentinel value)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (val as any).isEqual === 'function'
      );
    }

    return false;
  },
  { message: 'Expected Firebase Timestamp, JS Date, or serverTimestamp()' }
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
 * import { FirestoreMetadataSchema } from './schemas/common.schema.js';
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
