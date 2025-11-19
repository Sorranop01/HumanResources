/**
 * Permission Service
 * Handles all permission-related Firestore operations
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  type Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { Permission } from '@/shared/constants/permissions';
import type { Resource } from '@/shared/constants/resources';
import type { Role } from '@/shared/constants/roles';
import { db } from '@/shared/lib/firebase';
import {
  type AssignRolePermissionInput,
  assignRolePermissionSchema,
  type CreatePermissionDefinitionInput,
  createPermissionDefinitionSchema,
  type UpdateRolePermissionInput,
  updateRolePermissionSchema,
} from '../schemas/rbacSchemas';
import type {
  PermissionDefinition,
  PermissionDefinitionFirestore,
  RolePermission,
  RolePermissionFirestore,
} from '../types/rbacTypes';
import {
  buildAvailablePermissionDetails,
  getResourceName,
  getRoleName,
} from '../utils/denormalization';

const PERMISSION_DEFINITIONS_COLLECTION = 'permissionDefinitions';
const ROLE_PERMISSIONS_COLLECTION = 'rolePermissions';

/**
 * Convert Firestore document to PermissionDefinition
 */
function convertToPermissionDefinition(doc: PermissionDefinitionFirestore): PermissionDefinition {
  return {
    ...doc,
    createdAt: (doc.createdAt as Timestamp).toDate(),
    updatedAt: (doc.updatedAt as Timestamp).toDate(),
  };
}

/**
 * Convert Firestore document to RolePermission
 */
function convertToRolePermission(doc: RolePermissionFirestore): RolePermission {
  return {
    ...doc,
    createdAt: (doc.createdAt as Timestamp).toDate(),
    updatedAt: (doc.updatedAt as Timestamp).toDate(),
  };
}

// ============================================
// Permission Definitions
// ============================================

/**
 * Get all permission definitions
 */
export async function getAllPermissionDefinitions(): Promise<PermissionDefinition[]> {
  const permissionsRef = collection(db, PERMISSION_DEFINITIONS_COLLECTION);
  const snapshot = await getDocs(permissionsRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as PermissionDefinitionFirestore;
    return convertToPermissionDefinition(data);
  });
}

/**
 * Get active permission definitions
 */
export async function getActivePermissionDefinitions(): Promise<PermissionDefinition[]> {
  const permissionsRef = collection(db, PERMISSION_DEFINITIONS_COLLECTION);
  const q = query(permissionsRef, where('isActive', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as PermissionDefinitionFirestore;
    return convertToPermissionDefinition(data);
  });
}

/**
 * Get permission definition by resource
 */
export async function getPermissionByResource(
  resource: Resource
): Promise<PermissionDefinition | null> {
  const permissionsRef = collection(db, PERMISSION_DEFINITIONS_COLLECTION);
  const q = query(permissionsRef, where('resource', '==', resource));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const data = snapshot.docs[0]?.data() as PermissionDefinitionFirestore | undefined;
  if (!data) {
    return null;
  }

  return convertToPermissionDefinition(data);
}

/**
 * Create permission definition
 */
export async function createPermissionDefinition(
  data: CreatePermissionDefinitionInput,
  userId: string
): Promise<PermissionDefinition> {
  // Validate input
  const validatedData = createPermissionDefinitionSchema.parse(data);

  // Check if permission for resource already exists
  const existing = await getPermissionByResource(validatedData.resource);
  if (existing) {
    throw new Error(`Permission definition for ${validatedData.resource} already exists`);
  }

  const permissionsRef = collection(db, PERMISSION_DEFINITIONS_COLLECTION);

  const newPermission = {
    ...validatedData,
    isActive: true,
    // ✅ Add denormalized available permissions
    availablePermissions: buildAvailablePermissionDetails(
      validatedData.permissions as Permission[]
    ),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId,
  };

  const docRef = await addDoc(permissionsRef, newPermission);

  const snapshot = await getDoc(docRef);
  const createdData = snapshot.data() as PermissionDefinitionFirestore;

  return convertToPermissionDefinition({
    ...createdData,
    id: docRef.id,
  });
}

// ============================================
// Role-Permission Assignments
// ============================================

/**
 * Get all role permissions
 */
export async function getAllRolePermissions(): Promise<RolePermission[]> {
  const rolePermissionsRef = collection(db, ROLE_PERMISSIONS_COLLECTION);
  const snapshot = await getDocs(rolePermissionsRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as RolePermissionFirestore;
    return convertToRolePermission(data);
  });
}

/**
 * Get permissions for a specific role
 */
export async function getPermissionsByRole(role: Role): Promise<RolePermission[]> {
  const rolePermissionsRef = collection(db, ROLE_PERMISSIONS_COLLECTION);
  const q = query(rolePermissionsRef, where('role', '==', role), where('isActive', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as RolePermissionFirestore;
    return convertToRolePermission(data);
  });
}

/**
 * Get permissions for a specific role and resource
 */
export async function getRolePermissionByRoleAndResource(
  role: Role,
  resource: Resource
): Promise<RolePermission | null> {
  const rolePermissionsRef = collection(db, ROLE_PERMISSIONS_COLLECTION);
  const q = query(rolePermissionsRef, where('role', '==', role), where('resource', '==', resource));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const data = snapshot.docs[0]?.data() as RolePermissionFirestore | undefined;
  if (!data) {
    return null;
  }

  return convertToRolePermission(data);
}

/**
 * Assign permissions to a role for a resource
 */
export async function assignRolePermission(
  data: AssignRolePermissionInput,
  userId: string,
  roleId: string
): Promise<RolePermission> {
  // Validate input
  const validatedData = assignRolePermissionSchema.parse(data);

  // Check if assignment already exists
  const existing = await getRolePermissionByRoleAndResource(
    validatedData.role,
    validatedData.resource
  );

  if (existing) {
    // Update existing assignment
    return updateRolePermission(existing.id, { permissions: validatedData.permissions }, userId);
  }

  const rolePermissionsRef = collection(db, ROLE_PERMISSIONS_COLLECTION);

  const newRolePermission = {
    ...validatedData,
    roleId,
    // ✅ Add denormalized role and resource names
    roleName: getRoleName(validatedData.role),
    resourceName: getResourceName(validatedData.resource),
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId,
  };

  const docRef = await addDoc(rolePermissionsRef, newRolePermission);

  const snapshot = await getDoc(docRef);
  const createdData = snapshot.data() as RolePermissionFirestore;

  return convertToRolePermission({
    ...createdData,
    id: docRef.id,
  });
}

/**
 * Update role permission
 */
export async function updateRolePermission(
  id: string,
  data: UpdateRolePermissionInput,
  userId: string
): Promise<RolePermission> {
  // Validate input
  const validatedData = updateRolePermissionSchema.parse(data);

  const rolePermissionRef = doc(db, ROLE_PERMISSIONS_COLLECTION, id);
  const snapshot = await getDoc(rolePermissionRef);

  if (!snapshot.exists()) {
    throw new Error(`Role permission ${id} not found`);
  }

  await updateDoc(rolePermissionRef, {
    ...validatedData,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });

  const updatedSnapshot = await getDoc(rolePermissionRef);
  const updatedData = updatedSnapshot.data() as RolePermissionFirestore;

  return convertToRolePermission(updatedData);
}

/**
 * Revoke permissions from a role for a resource
 */
export async function revokeRolePermission(
  role: Role,
  resource: Resource,
  userId: string
): Promise<void> {
  const existing = await getRolePermissionByRoleAndResource(role, resource);

  if (!existing) {
    throw new Error(`Role permission for ${role} on ${resource} not found`);
  }

  const rolePermissionRef = doc(db, ROLE_PERMISSIONS_COLLECTION, existing.id);

  // Soft delete
  await updateDoc(rolePermissionRef, {
    isActive: false,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
}

/**
 * Permanently delete role permission
 */
export async function permanentlyDeleteRolePermission(id: string): Promise<void> {
  const rolePermissionRef = doc(db, ROLE_PERMISSIONS_COLLECTION, id);
  const snapshot = await getDoc(rolePermissionRef);

  if (!snapshot.exists()) {
    throw new Error(`Role permission ${id} not found`);
  }

  await deleteDoc(rolePermissionRef);
}

/**
 * Check if role has specific permission on resource
 */
export async function checkRolePermission(
  role: Role,
  resource: Resource,
  permission: Permission
): Promise<boolean> {
  const rolePermission = await getRolePermissionByRoleAndResource(role, resource);

  if (!rolePermission || !rolePermission.isActive) {
    return false;
  }

  return rolePermission.permissions.includes(permission);
}

/**
 * Get all resources accessible by a role
 */
export async function getAccessibleResources(role: Role): Promise<Resource[]> {
  const permissions = await getPermissionsByRole(role);

  return permissions.filter((p) => p.isActive).map((p) => p.resource);
}
