/**
 * Role Service
 * Handles all role-related Firestore operations
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
import type { Role } from '@/shared/constants/roles';
import { db } from '@/shared/lib/firebase';
import {
  type CreateRoleDefinitionInput,
  createRoleDefinitionSchema,
  type UpdateRoleDefinitionInput,
  updateRoleDefinitionSchema,
} from '../schemas/rbacSchemas';
import type { RoleDefinition, RoleDefinitionFirestore } from '../types/rbacTypes';

const COLLECTION_NAME = 'roleDefinitions';

/**
 * Convert Firestore document to RoleDefinition
 */
function convertToRoleDefinition(doc: RoleDefinitionFirestore): RoleDefinition {
  return {
    ...doc,
    createdAt: (doc.createdAt as Timestamp).toDate(),
    updatedAt: (doc.updatedAt as Timestamp).toDate(),
  };
}

/**
 * Get all role definitions
 */
export async function getAllRoles(): Promise<RoleDefinition[]> {
  const rolesRef = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(rolesRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as RoleDefinitionFirestore;
    return convertToRoleDefinition(data);
  });
}

/**
 * Get active role definitions
 */
export async function getActiveRoles(): Promise<RoleDefinition[]> {
  const rolesRef = collection(db, COLLECTION_NAME);
  const q = query(rolesRef, where('isActive', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as RoleDefinitionFirestore;
    return convertToRoleDefinition(data);
  });
}

/**
 * Get role definition by ID
 */
export async function getRoleById(id: string): Promise<RoleDefinition | null> {
  const roleRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(roleRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as RoleDefinitionFirestore;
  return convertToRoleDefinition(data);
}

/**
 * Get role definition by role type
 */
export async function getRoleByType(role: Role): Promise<RoleDefinition | null> {
  const rolesRef = collection(db, COLLECTION_NAME);
  const q = query(rolesRef, where('role', '==', role));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const data = snapshot.docs[0]?.data() as RoleDefinitionFirestore | undefined;
  if (!data) {
    return null;
  }

  return convertToRoleDefinition(data);
}

/**
 * Create new role definition
 */
export async function createRole(
  data: CreateRoleDefinitionInput,
  userId: string
): Promise<RoleDefinition> {
  // Validate input
  const validatedData = createRoleDefinitionSchema.parse(data);

  // Check if role already exists
  const existing = await getRoleByType(validatedData.role);
  if (existing) {
    throw new Error(`Role ${validatedData.role} already exists`);
  }

  const rolesRef = collection(db, COLLECTION_NAME);

  const newRole = {
    ...validatedData,
    isActive: true,
    isSystemRole: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId,
  };

  const docRef = await addDoc(rolesRef, newRole);

  const snapshot = await getDoc(docRef);
  const createdData = snapshot.data() as RoleDefinitionFirestore;

  return convertToRoleDefinition({
    ...createdData,
    id: docRef.id,
  });
}

/**
 * Update role definition
 */
export async function updateRole(
  id: string,
  data: UpdateRoleDefinitionInput,
  userId: string
): Promise<RoleDefinition> {
  // Validate input
  const validatedData = updateRoleDefinitionSchema.parse(data);

  const roleRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(roleRef);

  if (!snapshot.exists()) {
    throw new Error(`Role ${id} not found`);
  }

  const existingRole = snapshot.data() as RoleDefinitionFirestore;

  // Check if it's a system role
  if (existingRole.isSystemRole) {
    throw new Error('Cannot modify system role');
  }

  await updateDoc(roleRef, {
    ...validatedData,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });

  const updatedSnapshot = await getDoc(roleRef);
  const updatedData = updatedSnapshot.data() as RoleDefinitionFirestore;

  return convertToRoleDefinition(updatedData);
}

/**
 * Delete role definition (soft delete by setting isActive = false)
 */
export async function deleteRole(id: string, userId: string): Promise<void> {
  const roleRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(roleRef);

  if (!snapshot.exists()) {
    throw new Error(`Role ${id} not found`);
  }

  const existingRole = snapshot.data() as RoleDefinitionFirestore;

  // Check if it's a system role
  if (existingRole.isSystemRole) {
    throw new Error('Cannot delete system role');
  }

  // Soft delete
  await updateDoc(roleRef, {
    isActive: false,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
}

/**
 * Permanently delete role definition
 */
export async function permanentlyDeleteRole(id: string): Promise<void> {
  const roleRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(roleRef);

  if (!snapshot.exists()) {
    throw new Error(`Role ${id} not found`);
  }

  const existingRole = snapshot.data() as RoleDefinitionFirestore;

  // Check if it's a system role
  if (existingRole.isSystemRole) {
    throw new Error('Cannot delete system role');
  }

  await deleteDoc(roleRef);
}

/**
 * Toggle role active status
 */
export async function toggleRoleStatus(id: string, userId: string): Promise<RoleDefinition> {
  const roleRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(roleRef);

  if (!snapshot.exists()) {
    throw new Error(`Role ${id} not found`);
  }

  const existingRole = snapshot.data() as RoleDefinitionFirestore;

  await updateDoc(roleRef, {
    isActive: !existingRole.isActive,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });

  const updatedSnapshot = await getDoc(roleRef);
  const updatedData = updatedSnapshot.data() as RoleDefinitionFirestore;

  return convertToRoleDefinition(updatedData);
}
