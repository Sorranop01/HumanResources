/**
 * Permission Definition Types
 * Types for Firestore-based permission definitions
 */

import type { Timestamp } from 'firebase/firestore';
import type { Permission } from '@/shared/constants/permissions';
import type { Resource } from '@/shared/constants/resources';

/**
 * Permission Scope (for contextual permissions)
 */
export type PermissionScope = 'own' | 'all' | null;

/**
 * Permission Definition
 * Defines what a permission allows (routes, actions, UI elements)
 */
export interface PermissionDefinition {
  id: string;
  resource: Resource;
  permission: Permission;
  name: string;
  description: string;

  // Route access control
  routes: string[];

  // Action access control
  actions: string[];

  // UI element access control
  uiElements: string[];

  // Scope support
  scopes: PermissionScope[];

  // Categorization
  category: string;
  icon?: string;
  order: number;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Firestore version with Timestamp
 */
export interface PermissionDefinitionFirestore {
  id: string;
  resource: Resource;
  permission: Permission;
  name: string;
  description: string;
  routes: string[];
  actions: string[];
  uiElements: string[];
  scopes: PermissionScope[];
  category: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Route Permission
 * Maps routes to required permissions
 */
export interface RoutePermission {
  id: string;
  route: string;
  name: string;
  description: string;

  // Required permission to access this route
  resource: Resource;
  requiredPermission: Permission;
  scope: PermissionScope;

  // Ownership check (for :own scope)
  checkOwnership: boolean;
  ownershipField?: string; // e.g., "employeeId", "userId"

  // Redirect configuration
  redirectIfDenied: string;

  // Role-based access (additional restriction)
  allowedRoles?: string[];

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Firestore version
 */
export interface RoutePermissionFirestore {
  id: string;
  route: string;
  name: string;
  description: string;
  resource: Resource;
  requiredPermission: Permission;
  scope: PermissionScope;
  checkOwnership: boolean;
  ownershipField?: string;
  redirectIfDenied: string;
  allowedRoles?: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Action Permission
 * Maps actions to required permissions
 */
export interface ActionPermission {
  id: string;
  action: string;
  name: string;
  description: string;

  // Required permission to perform this action
  resource: Resource;
  requiredPermission: Permission;
  scope: PermissionScope;

  // Additional metadata
  category: string;
  icon?: string;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Firestore version
 */
export interface ActionPermissionFirestore {
  id: string;
  action: string;
  name: string;
  description: string;
  resource: Resource;
  requiredPermission: Permission;
  scope: PermissionScope;
  category: string;
  icon?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * UI Element Permission
 * Maps UI elements to required permissions
 */
export interface UIElementPermission {
  id: string;
  elementId: string;
  name: string;
  description: string;

  // Required permission to view this element
  resource: Resource;
  requiredPermission: Permission;
  scope: PermissionScope;

  // Element type
  elementType: 'menu' | 'button' | 'tab' | 'section' | 'field' | 'component';

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Firestore version
 */
export interface UIElementPermissionFirestore {
  id: string;
  elementId: string;
  name: string;
  description: string;
  resource: Resource;
  requiredPermission: Permission;
  scope: PermissionScope;
  elementType: 'menu' | 'button' | 'tab' | 'section' | 'field' | 'component';
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Input types for creation
 */
export interface CreatePermissionDefinitionInput {
  resource: Resource;
  permission: Permission;
  name: string;
  description: string;
  routes: string[];
  actions: string[];
  uiElements: string[];
  scopes: PermissionScope[];
  category: string;
  icon?: string;
  order: number;
}

export interface CreateRoutePermissionInput {
  route: string;
  name: string;
  description: string;
  resource: Resource;
  requiredPermission: Permission;
  scope: PermissionScope;
  checkOwnership: boolean;
  ownershipField?: string;
  redirectIfDenied: string;
  allowedRoles?: string[];
}

export interface CreateActionPermissionInput {
  action: string;
  name: string;
  description: string;
  resource: Resource;
  requiredPermission: Permission;
  scope: PermissionScope;
  category: string;
  icon?: string;
}
