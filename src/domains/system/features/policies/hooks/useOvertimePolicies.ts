/**
 * Overtime Policy Hooks
 * React Query hooks for overtime policy management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  CreateOvertimePolicyInput,
  OvertimePolicyFilters,
  UpdateOvertimePolicyInput,
} from '../types/overtimePolicy';
import { overtimePolicyService } from '../services/overtimePolicyService';

/**
 * Query keys for overtime policies
 */
export const overtimePolicyKeys = {
  all: ['overtimePolicies'] as const,
  lists: () => [...overtimePolicyKeys.all, 'list'] as const,
  list: (filters?: OvertimePolicyFilters) => [...overtimePolicyKeys.lists(), filters] as const,
  details: () => [...overtimePolicyKeys.all, 'detail'] as const,
  detail: (id: string) => [...overtimePolicyKeys.details(), id] as const,
  byCode: (code: string) => [...overtimePolicyKeys.all, 'code', code] as const,
};

/**
 * Get all overtime policies
 */
export function useOvertimePolicies(filters?: OvertimePolicyFilters) {
  return useQuery({
    queryKey: overtimePolicyKeys.list(filters),
    queryFn: () => overtimePolicyService.getAll(filters),
  });
}

/**
 * Get overtime policy by ID
 */
export function useOvertimePolicy(id: string | undefined) {
  return useQuery({
    queryKey: overtimePolicyKeys.detail(id || ''),
    queryFn: () => overtimePolicyService.getById(id || ''),
    enabled: !!id,
  });
}

/**
 * Get overtime policy by code
 */
export function useOvertimePolicyByCode(code: string | undefined) {
  return useQuery({
    queryKey: overtimePolicyKeys.byCode(code || ''),
    queryFn: () => overtimePolicyService.getByCode(code || ''),
    enabled: !!code,
  });
}

/**
 * Create overtime policy
 */
export function useCreateOvertimePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOvertimePolicyInput) => overtimePolicyService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimePolicyKeys.lists() });
      message.success('สร้าง Overtime Policy สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`สร้าง Overtime Policy ไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Update overtime policy
 */
export function useUpdateOvertimePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOvertimePolicyInput }) =>
      overtimePolicyService.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: overtimePolicyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: overtimePolicyKeys.detail(variables.id) });
      message.success('แก้ไข Overtime Policy สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`แก้ไข Overtime Policy ไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Delete overtime policy
 */
export function useDeleteOvertimePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => overtimePolicyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimePolicyKeys.lists() });
      message.success('ลบ Overtime Policy สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`ลบ Overtime Policy ไม่สำเร็จ: ${error.message}`);
    },
  });
}
