/**
 * Penalty Policy Hooks
 * React Query hooks for penalty policy management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  CreatePenaltyPolicyInput,
  PenaltyPolicyFilters,
  UpdatePenaltyPolicyInput,
} from '../types/penaltyPolicy';
import { penaltyPolicyService } from '../services/penaltyPolicyService';

/**
 * Query keys for penalty policies
 */
export const penaltyPolicyKeys = {
  all: ['penaltyPolicies'] as const,
  lists: () => [...penaltyPolicyKeys.all, 'list'] as const,
  list: (filters?: PenaltyPolicyFilters) => [...penaltyPolicyKeys.lists(), filters] as const,
  details: () => [...penaltyPolicyKeys.all, 'detail'] as const,
  detail: (id: string) => [...penaltyPolicyKeys.details(), id] as const,
  byCode: (code: string) => [...penaltyPolicyKeys.all, 'code', code] as const,
};

/**
 * Get all penalty policies
 */
export function usePenaltyPolicies(filters?: PenaltyPolicyFilters) {
  return useQuery({
    queryKey: penaltyPolicyKeys.list(filters),
    queryFn: () => penaltyPolicyService.getAll(filters),
  });
}

/**
 * Get penalty policy by ID
 */
export function usePenaltyPolicy(id: string | undefined) {
  return useQuery({
    queryKey: penaltyPolicyKeys.detail(id || ''),
    queryFn: () => penaltyPolicyService.getById(id || ''),
    enabled: !!id,
  });
}

/**
 * Get penalty policy by code
 */
export function usePenaltyPolicyByCode(code: string | undefined) {
  return useQuery({
    queryKey: penaltyPolicyKeys.byCode(code || ''),
    queryFn: () => penaltyPolicyService.getByCode(code || ''),
    enabled: !!code,
  });
}

/**
 * Create penalty policy
 */
export function useCreatePenaltyPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePenaltyPolicyInput) => penaltyPolicyService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: penaltyPolicyKeys.lists() });
      message.success('สร้าง Penalty Policy สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`สร้าง Penalty Policy ไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Update penalty policy
 */
export function useUpdatePenaltyPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePenaltyPolicyInput }) =>
      penaltyPolicyService.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: penaltyPolicyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: penaltyPolicyKeys.detail(variables.id) });
      message.success('แก้ไข Penalty Policy สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`แก้ไข Penalty Policy ไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Delete penalty policy
 */
export function useDeletePenaltyPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => penaltyPolicyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: penaltyPolicyKeys.lists() });
      message.success('ลบ Penalty Policy สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`ลบ Penalty Policy ไม่สำเร็จ: ${error.message}`);
    },
  });
}
