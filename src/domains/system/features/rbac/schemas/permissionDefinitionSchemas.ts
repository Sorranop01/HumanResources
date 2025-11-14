/**
 * Permission Definition Schemas (Zod)
 * Validation schemas for Firestore-based permission system
 */

import { z } from 'zod';
import { permissionSchema, resourceSchema } from './rbacSchemas';

/**
 * Permission Scope Schema
 */
export const permissionScopeSchema = z.enum(['own', 'all']).nullable();

/**
 * UI Element Type Schema
 */
export const uiElementTypeSchema = z.enum([
  'menu',
  'button',
  'tab',
  'section',
  'field',
  'component',
]);

/**
 * Permission Definition Schema
 */
export const permissionDefinitionDetailSchema = z.object({
  id: z.string().min(1),
  resource: resourceSchema,
  permission: permissionSchema,
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  routes: z.array(z.string()),
  actions: z.array(z.string()),
  uiElements: z.array(z.string()),
  scopes: z.array(permissionScopeSchema),
  category: z.string().min(1),
  icon: z.string().optional(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Create Permission Definition Schema
 */
export const createPermissionDefinitionDetailSchema = z.object({
  resource: resourceSchema,
  permission: permissionSchema,
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  routes: z.array(z.string()).default([]),
  actions: z.array(z.string()).default([]),
  uiElements: z.array(z.string()).default([]),
  scopes: z.array(permissionScopeSchema).default([null]),
  category: z.string().min(1),
  icon: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

/**
 * Route Permission Schema
 */
export const routePermissionSchema = z.object({
  id: z.string().min(1),
  route: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  resource: resourceSchema,
  requiredPermission: permissionSchema,
  scope: permissionScopeSchema,
  checkOwnership: z.boolean(),
  ownershipField: z.string().optional(),
  redirectIfDenied: z.string().default('/unauthorized'),
  allowedRoles: z.array(z.string()).optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Create Route Permission Schema
 */
export const createRoutePermissionSchema = z.object({
  route: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  resource: resourceSchema,
  requiredPermission: permissionSchema,
  scope: permissionScopeSchema,
  checkOwnership: z.boolean().default(false),
  ownershipField: z.string().optional(),
  redirectIfDenied: z.string().default('/unauthorized'),
  allowedRoles: z.array(z.string()).optional(),
});

/**
 * Action Permission Schema
 */
export const actionPermissionSchema = z.object({
  id: z.string().min(1),
  action: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  resource: resourceSchema,
  requiredPermission: permissionSchema,
  scope: permissionScopeSchema,
  category: z.string().min(1),
  icon: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Create Action Permission Schema
 */
export const createActionPermissionSchema = z.object({
  action: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  resource: resourceSchema,
  requiredPermission: permissionSchema,
  scope: permissionScopeSchema,
  category: z.string().min(1),
  icon: z.string().optional(),
});

/**
 * UI Element Permission Schema
 */
export const uiElementPermissionSchema = z.object({
  id: z.string().min(1),
  elementId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  resource: resourceSchema,
  requiredPermission: permissionSchema,
  scope: permissionScopeSchema,
  elementType: uiElementTypeSchema,
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Type exports
 */
export type PermissionDefinitionDetail = z.infer<typeof permissionDefinitionDetailSchema>;
export type CreatePermissionDefinitionDetail = z.infer<
  typeof createPermissionDefinitionDetailSchema
>;
export type RoutePermissionType = z.infer<typeof routePermissionSchema>;
export type CreateRoutePermissionType = z.infer<typeof createRoutePermissionSchema>;
export type ActionPermissionType = z.infer<typeof actionPermissionSchema>;
export type CreateActionPermissionType = z.infer<typeof createActionPermissionSchema>;
export type UIElementPermissionType = z.infer<typeof uiElementPermissionSchema>;
