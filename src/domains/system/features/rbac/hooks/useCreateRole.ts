/**
 * useCreateRole Hook (Cloud Functions)
 * Creates a new custom role via Cloud Functions (admin-only)
 *
 * Per docs/standards/07-firestore-data-modeling-ai.md:
 * "Privileged write (admin-only) → Cloud Functions"
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateRoleInput } from '../services/roleCloudFunctionService';
import * as roleCloudFunctionService from '../services/roleCloudFunctionService';
import { roleKeys } from './useRoles';

export type { CreateRoleInput };

export function useCreateRoleCloudFunction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRoleInput) => roleCloudFunctionService.createRole(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
    onError: (error: unknown) => {
      console.error('Failed to create role:', error);
    },
  });
}
