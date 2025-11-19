/**
 * Permission Definition Service
 * Firestore operations for permission definitions, route permissions, and action permissions
 */

import {
  addDoc,
  collection,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  type Timestamp,
  where,
} from 'firebase/firestore';
import type { Permission } from '@/shared/constants/permissions';
import type { Resource } from '@/shared/constants/resources';
import { db } from '@/shared/lib/firebase';
import {
  type CreatePermissionDefinitionDetail,
  createPermissionDefinitionDetailSchema,
  type CreateRoutePermissionType,
  createRoutePermissionSchema,
  type CreateActionPermissionType,
  createActionPermissionSchema,
} from '../schemas/permissionDefinitionSchemas';
import type {
  PermissionDefinition,
  PermissionDefinitionFirestore,
  RoutePermission,
  RoutePermissionFirestore,
  ActionPermission,
  ActionPermissionFirestore,
} from '../types/permissionDefinitionTypes';

const PERMISSION_DEFINITIONS_COLLECTION = 'permissionDefinitions';
const ROUTE_PERMISSIONS_COLLECTION = 'routePermissions';
const ACTION_PERMISSIONS_COLLECTION = 'actionPermissions';

// ============================================
// Converters
// ============================================

function convertToPermissionDefinition(doc: PermissionDefinitionFirestore): PermissionDefinition {
  return {
    ...doc,
    createdAt: (doc.createdAt as Timestamp).toDate(),
    updatedAt: (doc.updatedAt as Timestamp).toDate(),
  };
}

function convertToRoutePermission(doc: RoutePermissionFirestore): RoutePermission {
  return {
    ...doc,
    createdAt: (doc.createdAt as Timestamp).toDate(),
    updatedAt: (doc.updatedAt as Timestamp).toDate(),
  };
}

function convertToActionPermission(doc: ActionPermissionFirestore): ActionPermission {
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
    return convertToPermissionDefinition({ ...data, id: doc.id });
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
    return convertToPermissionDefinition({ ...data, id: doc.id });
  });
}

/**
 * Get permission definitions by resource
 */
export async function getPermissionDefinitionsByResource(
  resource: Resource
): Promise<PermissionDefinition[]> {
  const permissionsRef = collection(db, PERMISSION_DEFINITIONS_COLLECTION);
  const q = query(permissionsRef, where('resource', '==', resource), where('isActive', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as PermissionDefinitionFirestore;
    return convertToPermissionDefinition({ ...data, id: doc.id });
  });
}

/**
 * Get permission definition by resource and permission
 */
export async function getPermissionDefinition(
  resource: Resource,
  permission: Permission
): Promise<PermissionDefinition | null> {
  const permissionsRef = collection(db, PERMISSION_DEFINITIONS_COLLECTION);
  const q = query(
    permissionsRef,
    where('resource', '==', resource),
    where('permission', '==', permission)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  if (!doc) {
    return null;
  }

  const data = doc.data() as PermissionDefinitionFirestore;
  return convertToPermissionDefinition({ ...data, id: doc.id });
}

/**
 * Create permission definition
 */
export async function createPermissionDefinition(
  data: CreatePermissionDefinitionDetail,
  userId: string
): Promise<PermissionDefinition> {
  const validatedData = createPermissionDefinitionDetailSchema.parse(data);

  // Check if already exists
  const existing = await getPermissionDefinition(validatedData.resource, validatedData.permission as Permission);
  if (existing) {
    throw new Error(
      `Permission definition for ${validatedData.resource}:${validatedData.permission} already exists`
    );
  }

  const permissionsRef = collection(db, PERMISSION_DEFINITIONS_COLLECTION);

  const newPermission = {
    ...validatedData,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId,
  };

  const docRef = await addDoc(permissionsRef, newPermission);
  const snapshot = await getDoc(docRef);
  const createdData = snapshot.data() as PermissionDefinitionFirestore;

  return convertToPermissionDefinition({ ...createdData, id: docRef.id });
}

// ============================================
// Route Permissions
// ============================================

/**
 * Get all route permissions
 */
export async function getAllRoutePermissions(): Promise<RoutePermission[]> {
  const routesRef = collection(db, ROUTE_PERMISSIONS_COLLECTION);
  const snapshot = await getDocs(routesRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as RoutePermissionFirestore;
    return convertToRoutePermission({ ...data, id: doc.id });
  });
}

/**
 * Get active route permissions
 */
export async function getActiveRoutePermissions(): Promise<RoutePermission[]> {
  const routesRef = collection(db, ROUTE_PERMISSIONS_COLLECTION);
  const q = query(routesRef, where('isActive', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as RoutePermissionFirestore;
    return convertToRoutePermission({ ...data, id: doc.id });
  });
}

/**
 * Get route permission by route path
 */
export async function getRoutePermission(route: string): Promise<RoutePermission | null> {
  const routesRef = collection(db, ROUTE_PERMISSIONS_COLLECTION);
  const q = query(routesRef, where('route', '==', route), where('isActive', '==', true));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  if (!doc) {
    return null;
  }

  const data = doc.data() as RoutePermissionFirestore;
  return convertToRoutePermission({ ...data, id: doc.id });
}

/**
 * Create route permission
 */
export async function createRoutePermission(
  data: CreateRoutePermissionType
): Promise<RoutePermission> {
  const validatedData = createRoutePermissionSchema.parse(data);

  const routesRef = collection(db, ROUTE_PERMISSIONS_COLLECTION);

  const newRoute = {
    ...validatedData,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(routesRef, newRoute);
  const snapshot = await getDoc(docRef);
  const createdData = snapshot.data() as RoutePermissionFirestore;

  return convertToRoutePermission({ ...createdData, id: docRef.id });
}

// ============================================
// Action Permissions
// ============================================

/**
 * Get all action permissions
 */
export async function getAllActionPermissions(): Promise<ActionPermission[]> {
  const actionsRef = collection(db, ACTION_PERMISSIONS_COLLECTION);
  const snapshot = await getDocs(actionsRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as ActionPermissionFirestore;
    return convertToActionPermission({ ...data, id: doc.id });
  });
}

/**
 * Get active action permissions
 */
export async function getActiveActionPermissions(): Promise<ActionPermission[]> {
  const actionsRef = collection(db, ACTION_PERMISSIONS_COLLECTION);
  const q = query(actionsRef, where('isActive', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as ActionPermissionFirestore;
    return convertToActionPermission({ ...data, id: doc.id });
  });
}

/**
 * Get action permission by action name
 */
export async function getActionPermission(action: string): Promise<ActionPermission | null> {
  const actionsRef = collection(db, ACTION_PERMISSIONS_COLLECTION);
  const q = query(actionsRef, where('action', '==', action), where('isActive', '==', true));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  if (!doc) {
    return null;
  }

  const data = doc.data() as ActionPermissionFirestore;
  return convertToActionPermission({ ...data, id: doc.id });
}

/**
 * Create action permission
 */
export async function createActionPermission(
  data: CreateActionPermissionType
): Promise<ActionPermission> {
  const validatedData = createActionPermissionSchema.parse(data);

  const actionsRef = collection(db, ACTION_PERMISSIONS_COLLECTION);

  const newAction = {
    ...validatedData,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(actionsRef, newAction);
  const snapshot = await getDoc(docRef);
  const createdData = snapshot.data() as ActionPermissionFirestore;

  return convertToActionPermission({ ...createdData, id: docRef.id });
}
