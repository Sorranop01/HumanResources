/**
 * useRoles Hook (Cloud Functions)
 * Query roles via Cloud Functions
 *
 * Per docs/standards/07-firestore-data-modeling-ai.md:
 * "Public read (authorized via rules) → Client ✅"
 * But we use Cloud Functions for consistency with CRUD operations
 */

import { useQuery } from '@tanstack/react-query';
import type { RoleDefinition } from '../services/roleCloudFunctionService';
import * as roleCloudFunctionService from '../services/roleCloudFunctionService';
import { roleKeys } from './useRoles';

/**
 * Get all roles (system + custom)
 */
export function useAllRolesCloudFunction() {
  return useQuery<RoleDefinition[], Error>({
    queryKey: [...roleKeys.lists(), 'cloud-function'],
    queryFn: () => roleCloudFunctionService.getAllRoles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get active roles only
 */
export function useActiveRolesCloudFunction() {
  return useQuery<RoleDefinition[], Error>({
    queryKey: [...roleKeys.list('active'), 'cloud-function'],
    queryFn: () => roleCloudFunctionService.getActiveRoles(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get custom roles only (non-system)
 */
export function useCustomRolesCloudFunction() {
  return useQuery<RoleDefinition[], Error>({
    queryKey: [...roleKeys.list('custom'), 'cloud-function'],
    queryFn: () => roleCloudFunctionService.getCustomRoles(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get system roles only
 */
export function useSystemRolesCloudFunction() {
  return useQuery<RoleDefinition[], Error>({
    queryKey: [...roleKeys.list('system'), 'cloud-function'],
    queryFn: () => roleCloudFunctionService.getSystemRoles(),
    staleTime: 5 * 60 * 1000,
  });
}
