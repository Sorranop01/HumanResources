/**
 * Payroll Hooks
 * React Query hooks for payroll data fetching and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { payrollService } from '../services/payrollService';
import type {
  ApprovePayrollInput,
  CreatePayrollInput,
  PayrollFilters,
  ProcessPaymentInput,
  UpdatePayrollInput,
} from '../types';

// Query Keys
export const payrollKeys = {
  all: ['payroll'] as const,
  lists: () => [...payrollKeys.all, 'list'] as const,
  list: (filters?: PayrollFilters) => [...payrollKeys.lists(), { filters }] as const,
  details: () => [...payrollKeys.all, 'detail'] as const,
  detail: (id: string) => [...payrollKeys.details(), id] as const,
  summary: (month: number, year: number) => [...payrollKeys.all, 'summary', month, year] as const,
  byEmployee: (employeeId: string, month: number, year: number) =>
    [...payrollKeys.all, 'byEmployee', employeeId, month, year] as const,
};

/**
 * Get all payroll records with optional filters
 */
export function usePayrollList(filters?: PayrollFilters) {
  return useQuery({
    queryKey: payrollKeys.list(filters),
    queryFn: () => payrollService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get single payroll record by ID
 */
export function usePayroll(id: string | undefined) {
  return useQuery({
    queryKey: payrollKeys.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Payroll ID is required');
      return payrollService.getById(id);
    },
    enabled: !!id,
  });
}

/**
 * Get payroll by employee and period
 */
export function usePayrollByEmployee(employeeId: string, month: number, year: number) {
  return useQuery({
    queryKey: payrollKeys.byEmployee(employeeId, month, year),
    queryFn: () => payrollService.getByEmployeeAndPeriod(employeeId, month, year),
    enabled: !!employeeId && !!month && !!year,
  });
}

/**
 * Get payroll summary for a period
 */
export function usePayrollSummary(month: number, year: number) {
  return useQuery({
    queryKey: payrollKeys.summary(month, year),
    queryFn: () => payrollService.getSummary(month, year),
    enabled: !!month && !!year,
  });
}

/**
 * Create new payroll record
 */
export function useCreatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePayrollInput) => payrollService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });
      message.success('สร้างข้อมูลเงินเดือนสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถสร้างข้อมูลเงินเดือนได้');
    },
  });
}

/**
 * Update payroll record
 */
export function useUpdatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePayrollInput }) =>
      payrollService.update(id, input),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: payrollKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });
      message.success('อัปเดตข้อมูลเงินเดือนสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถอัปเดตข้อมูลเงินเดือนได้');
    },
  });
}

/**
 * Approve payroll record
 */
export function useApprovePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApprovePayrollInput }) =>
      payrollService.approve(id, input),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: payrollKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });
      message.success('อนุมัติข้อมูลเงินเดือนสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถอนุมัติข้อมูลเงินเดือนได้');
    },
  });
}

/**
 * Process payment for payroll
 */
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProcessPaymentInput }) =>
      payrollService.processPayment(id, input),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: payrollKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });
      message.success('จ่ายเงินสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถจ่ายเงินได้');
    },
  });
}
