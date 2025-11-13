/**
 * Work Schedule Policy Hooks
 * React Query hooks for work schedule policy management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { workSchedulePolicyService } from '../services/workSchedulePolicyService';
import type {
  CreateWorkSchedulePolicyInput,
  UpdateWorkSchedulePolicyInput,
  WorkSchedulePolicyFilters,
} from '../types/workSchedulePolicy';

/**
 * Query keys for work schedule policies
 */
export const workSchedulePolicyKeys = {
  all: ['workSchedulePolicies'] as const,
  lists: () => [...workSchedulePolicyKeys.all, 'list'] as const,
  list: (filters?: WorkSchedulePolicyFilters) =>
    [...workSchedulePolicyKeys.lists(), filters] as const,
  details: () => [...workSchedulePolicyKeys.all, 'detail'] as const,
  detail: (id: string) => [...workSchedulePolicyKeys.details(), id] as const,
  byCode: (code: string) => [...workSchedulePolicyKeys.all, 'code', code] as const,
};

/**
 * Get all work schedule policies
 */
export function useWorkSchedulePolicies(filters?: WorkSchedulePolicyFilters) {
  return useQuery({
    queryKey: workSchedulePolicyKeys.list(filters),
    queryFn: () => workSchedulePolicyService.getAll(filters),
  });
}

/**
 * Get work schedule policy by ID
 */
export function useWorkSchedulePolicy(id: string | undefined) {
  return useQuery({
    queryKey: workSchedulePolicyKeys.detail(id || ''),
    queryFn: () => workSchedulePolicyService.getById(id || ''),
    enabled: !!id,
  });
}

/**
 * Get work schedule policy by code
 */
export function useWorkSchedulePolicyByCode(code: string | undefined) {
  return useQuery({
    queryKey: workSchedulePolicyKeys.byCode(code || ''),
    queryFn: () => workSchedulePolicyService.getByCode(code || ''),
    enabled: !!code,
  });
}

/**
 * Create work schedule policy
 */
export function useCreateWorkSchedulePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkSchedulePolicyInput) => workSchedulePolicyService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workSchedulePolicyKeys.lists() });
      message.success('สร้าง Work Schedule Policy สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`สร้าง Work Schedule Policy ไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Update work schedule policy
 */
export function useUpdateWorkSchedulePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWorkSchedulePolicyInput }) =>
      workSchedulePolicyService.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workSchedulePolicyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workSchedulePolicyKeys.detail(variables.id) });
      message.success('แก้ไข Work Schedule Policy สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`แก้ไข Work Schedule Policy ไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Delete work schedule policy
 */
export function useDeleteWorkSchedulePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workSchedulePolicyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workSchedulePolicyKeys.lists() });
      message.success('ลบ Work Schedule Policy สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`ลบ Work Schedule Policy ไม่สำเร็จ: ${error.message}`);
    },
  });
}
