/**
 * RBAC Audit Log Service
 * Handles audit logging for RBAC operations
 */

import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
  where,
} from 'firebase/firestore';
import type { Role } from '@/shared/constants/roles';
import { db } from '@/shared/lib/firebase';
import type { RBACAuditLog, RBACAuditLogFirestore } from '../types/rbacTypes';
import type { Permission, Resource } from '../utils/checkPermission';

const COLLECTION_NAME = 'rbacAuditLogs';

/**
 * Convert Firestore document to RBACAuditLog
 */
function convertToRBACAuditLog(doc: RBACAuditLogFirestore): RBACAuditLog {
  return {
    ...doc,
    timestamp: (doc.timestamp as Timestamp).toDate(),
  };
}

/**
 * Create audit log entry
 */
async function createAuditLog(
  data: Omit<RBACAuditLogFirestore, 'id' | 'timestamp'>
): Promise<RBACAuditLog> {
  const logsRef = collection(db, COLLECTION_NAME);

  const newLog = {
    ...data,
    timestamp: serverTimestamp(),
  };

  const docRef = await addDoc(logsRef, newLog);

  return {
    ...data,
    id: docRef.id,
    timestamp: new Date(),
  };
}

/**
 * Log role assignment
 */
export async function logRoleAssignment(
  performedBy: string,
  performedByEmail: string,
  targetUserId: string,
  targetUserEmail: string,
  role: Role,
  metadata?: Record<string, unknown> | undefined,
  ipAddress?: string | undefined,
  userAgent?: string | undefined
): Promise<RBACAuditLog> {
  return createAuditLog({
    action: 'ROLE_ASSIGNED',
    performedBy,
    performedByEmail,
    targetUserId,
    targetUserEmail,
    role,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Log role revocation
 */
export async function logRoleRevocation(
  performedBy: string,
  performedByEmail: string,
  targetUserId: string,
  targetUserEmail: string,
  role: Role,
  metadata?: Record<string, unknown> | undefined,
  ipAddress?: string | undefined,
  userAgent?: string | undefined
): Promise<RBACAuditLog> {
  return createAuditLog({
    action: 'ROLE_REVOKED',
    performedBy,
    performedByEmail,
    targetUserId,
    targetUserEmail,
    role,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Log permission grant
 */
export async function logPermissionGrant(
  performedBy: string,
  performedByEmail: string,
  role: Role,
  resource: Resource,
  permissions: Permission[],
  metadata?: Record<string, unknown> | undefined,
  ipAddress?: string | undefined,
  userAgent?: string | undefined
): Promise<RBACAuditLog> {
  return createAuditLog({
    action: 'PERMISSION_GRANTED',
    performedBy,
    performedByEmail,
    role,
    resource,
    permissions,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Log permission revocation
 */
export async function logPermissionRevocation(
  performedBy: string,
  performedByEmail: string,
  role: Role,
  resource: Resource,
  permissions: Permission[],
  metadata?: Record<string, unknown> | undefined,
  ipAddress?: string | undefined,
  userAgent?: string | undefined
): Promise<RBACAuditLog> {
  return createAuditLog({
    action: 'PERMISSION_REVOKED',
    performedBy,
    performedByEmail,
    role,
    resource,
    permissions,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Log role creation
 */
export async function logRoleCreation(
  performedBy: string,
  performedByEmail: string,
  role: Role,
  metadata?: Record<string, unknown> | undefined,
  ipAddress?: string | undefined,
  userAgent?: string | undefined
): Promise<RBACAuditLog> {
  return createAuditLog({
    action: 'ROLE_CREATED',
    performedBy,
    performedByEmail,
    role,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Log role update
 */
export async function logRoleUpdate(
  performedBy: string,
  performedByEmail: string,
  role: Role,
  metadata?: Record<string, unknown> | undefined,
  ipAddress?: string | undefined,
  userAgent?: string | undefined
): Promise<RBACAuditLog> {
  return createAuditLog({
    action: 'ROLE_UPDATED',
    performedBy,
    performedByEmail,
    role,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Log role deletion
 */
export async function logRoleDeletion(
  performedBy: string,
  performedByEmail: string,
  role: Role,
  metadata?: Record<string, unknown> | undefined,
  ipAddress?: string | undefined,
  userAgent?: string | undefined
): Promise<RBACAuditLog> {
  return createAuditLog({
    action: 'ROLE_DELETED',
    performedBy,
    performedByEmail,
    role,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Get all audit logs
 */
export async function getAllAuditLogs(limitCount = 100): Promise<RBACAuditLog[]> {
  const logsRef = collection(db, COLLECTION_NAME);
  const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as RBACAuditLogFirestore;
    return convertToRBACAuditLog(data);
  });
}

/**
 * Get audit logs by user
 */
export async function getAuditLogsByUser(userId: string, limitCount = 50): Promise<RBACAuditLog[]> {
  const logsRef = collection(db, COLLECTION_NAME);
  const q = query(
    logsRef,
    where('performedBy', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as RBACAuditLogFirestore;
    return convertToRBACAuditLog(data);
  });
}

/**
 * Get audit logs for a target user
 */
export async function getAuditLogsForTargetUser(
  targetUserId: string,
  limitCount = 50
): Promise<RBACAuditLog[]> {
  const logsRef = collection(db, COLLECTION_NAME);
  const q = query(
    logsRef,
    where('targetUserId', '==', targetUserId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as RBACAuditLogFirestore;
    return convertToRBACAuditLog(data);
  });
}

/**
 * Get audit logs by action
 */
export async function getAuditLogsByAction(
  action: RBACAuditLog['action'],
  limitCount = 50
): Promise<RBACAuditLog[]> {
  const logsRef = collection(db, COLLECTION_NAME);
  const q = query(
    logsRef,
    where('action', '==', action),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as RBACAuditLogFirestore;
    return convertToRBACAuditLog(data);
  });
}

/**
 * Get audit logs by role
 */
export async function getAuditLogsByRole(role: Role, limitCount = 50): Promise<RBACAuditLog[]> {
  const logsRef = collection(db, COLLECTION_NAME);
  const q = query(
    logsRef,
    where('role', '==', role),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as RBACAuditLogFirestore;
    return convertToRBACAuditLog(data);
  });
}

/**
 * Get recent audit logs
 */
export async function getRecentAuditLogs(limitCount = 20): Promise<RBACAuditLog[]> {
  return getAllAuditLogs(limitCount);
}
