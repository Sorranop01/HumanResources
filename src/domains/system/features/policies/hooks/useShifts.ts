/**
 * Shift Management Hooks
 * React Query hooks for shift management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { shiftAssignmentService } from '../services/shiftAssignmentService';
import { shiftService } from '../services/shiftService';
import type {
  CreateShiftAssignmentInput,
  CreateShiftInput,
  ShiftAssignmentFilters,
  ShiftFilters,
  UpdateShiftAssignmentInput,
  UpdateShiftInput,
} from '../types/shift';

/**
 * Query keys for shifts
 */
export const shiftKeys = {
  all: ['shifts'] as const,
  lists: () => [...shiftKeys.all, 'list'] as const,
  list: (filters?: ShiftFilters) => [...shiftKeys.lists(), filters] as const,
  details: () => [...shiftKeys.all, 'detail'] as const,
  detail: (id: string) => [...shiftKeys.details(), id] as const,
  byCode: (code: string) => [...shiftKeys.all, 'code', code] as const,
};

export const shiftAssignmentKeys = {
  all: ['shiftAssignments'] as const,
  lists: () => [...shiftAssignmentKeys.all, 'list'] as const,
  list: (filters?: ShiftAssignmentFilters) => [...shiftAssignmentKeys.lists(), filters] as const,
  details: () => [...shiftAssignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...shiftAssignmentKeys.details(), id] as const,
  byEmployee: (employeeId: string) => [...shiftAssignmentKeys.all, 'employee', employeeId] as const,
  current: (employeeId: string, date: Date) =>
    [...shiftAssignmentKeys.all, 'current', employeeId, date.toISOString()] as const,
};

/**
 * Get all shifts
 */
export function useShifts(filters?: ShiftFilters) {
  return useQuery({
    queryKey: shiftKeys.list(filters),
    queryFn: () => shiftService.getAll(filters),
  });
}

/**
 * Get shift by ID
 */
export function useShift(id: string | undefined) {
  return useQuery({
    queryKey: shiftKeys.detail(id || ''),
    queryFn: () => shiftService.getById(id || ''),
    enabled: !!id,
  });
}

/**
 * Create shift
 */
export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateShiftInput) => shiftService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
      message.success('สร้างกะทำงานสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`สร้างกะทำงานไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Update shift
 */
export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateShiftInput }) =>
      shiftService.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shiftKeys.detail(variables.id) });
      message.success('แก้ไขกะทำงานสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`แก้ไขกะทำงานไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Delete shift
 */
export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shiftService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
      message.success('ลบกะทำงานสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`ลบกะทำงานไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Get all shift assignments
 */
export function useShiftAssignments(filters?: ShiftAssignmentFilters) {
  return useQuery({
    queryKey: shiftAssignmentKeys.list(filters),
    queryFn: () => shiftAssignmentService.getAll(filters),
  });
}

/**
 * Get shift assignments by employee ID
 */
export function useEmployeeShiftAssignments(employeeId: string | undefined) {
  return useQuery({
    queryKey: shiftAssignmentKeys.byEmployee(employeeId || ''),
    queryFn: () => shiftAssignmentService.getByEmployeeId(employeeId || ''),
    enabled: !!employeeId,
  });
}

/**
 * Get current shift for employee
 */
export function useCurrentShift(employeeId: string | undefined, date: Date) {
  return useQuery({
    queryKey: shiftAssignmentKeys.current(employeeId || '', date),
    queryFn: () => shiftAssignmentService.getCurrentShift(employeeId || '', date),
    enabled: !!employeeId,
  });
}

/**
 * Create shift assignment
 */
export function useCreateShiftAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateShiftAssignmentInput) => shiftAssignmentService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.lists() });
      message.success('มอบหมายกะทำงานสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`มอบหมายกะทำงานไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Update shift assignment
 */
export function useUpdateShiftAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateShiftAssignmentInput }) =>
      shiftAssignmentService.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.detail(variables.id) });
      message.success('แก้ไขการมอบหมายกะสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`แก้ไขการมอบหมายกะไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Delete shift assignment
 */
export function useDeleteShiftAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shiftAssignmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.lists() });
      message.success('ลบการมอบหมายกะสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`ลบการมอบหมายกะไม่สำเร็จ: ${error.message}`);
    },
  });
}
