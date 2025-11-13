/**
 * Overtime Hooks
 * React Query hooks that wrap overtimeService operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { OvertimeFilters } from '@/domains/people/features/overtime/schemas';
import {
  overtimeKeys,
  overtimeService,
} from '@/domains/people/features/overtime/services/overtimeService';
import type {
  CreateOvertimeRequestInput,
  UpdateOvertimeRequestInput,
} from '@/domains/people/features/overtime/types';

/**
 * Get overtime requests list with optional filters
 */
export function useOvertimeList(filters?: OvertimeFilters) {
  return useQuery({
    queryKey: overtimeKeys.list(filters),
    queryFn: () => overtimeService.getAll(filters),
  });
}

/**
 * Get single overtime request by id
 */
export function useOvertimeRequest(id: string | undefined) {
  return useQuery({
    queryKey: overtimeKeys.detail(id ?? ''),
    queryFn: () => overtimeService.getById(id ?? ''),
    enabled: Boolean(id),
  });
}

/**
 * Get overtime requests for current employee
 */
export function useMyOvertimeRequests(employeeId: string | undefined) {
  return useQuery({
    queryKey: overtimeKeys.myRequests(employeeId ?? ''),
    queryFn: () => overtimeService.getMyRequests(employeeId ?? ''),
    enabled: Boolean(employeeId),
  });
}

/**
 * Get pending overtime approvals (manager/HR view)
 */
export function usePendingApprovals() {
  return useQuery({
    queryKey: overtimeKeys.pending(),
    queryFn: () => overtimeService.getPendingRequests(),
  });
}

/**
 * Create new overtime request
 */
export function useCreateOvertimeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOvertimeRequestInput) => overtimeService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      message.success('ส่งคำขอ OT สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถส่งคำขอ OT ได้');
    },
  });
}

interface UpdateOvertimeRequestVariables {
  id: string;
  input: UpdateOvertimeRequestInput;
}

/**
 * Update existing overtime request (pending only)
 */
export function useUpdateOvertimeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateOvertimeRequestVariables) =>
      overtimeService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      message.success('แก้ไขคำขอ OT สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถแก้ไขคำขอ OT ได้');
    },
  });
}

interface ApproveOvertimeVariables {
  requestId: string;
  approverId: string;
  approverName: string;
  comments?: string;
}

/**
 * Approve overtime request
 */
export function useApproveOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, approverId, approverName, comments }: ApproveOvertimeVariables) =>
      overtimeService.approve(requestId, approverId, approverName, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      message.success('อนุมัติคำขอ OT สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถอนุมัติคำขอ OT ได้');
    },
  });
}

interface RejectOvertimeVariables {
  requestId: string;
  approverId: string;
  approverName: string;
  reason: string;
}

/**
 * Reject overtime request
 */
export function useRejectOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, approverId, approverName, reason }: RejectOvertimeVariables) =>
      overtimeService.reject(requestId, approverId, approverName, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      message.success('ปฏิเสธคำขอ OT สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถปฏิเสธคำขอ OT ได้');
    },
  });
}

/**
 * Cancel overtime request
 */
export function useCancelOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => overtimeService.cancel(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      message.success('ยกเลิกคำขอ OT สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถยกเลิกคำขอ OT ได้');
    },
  });
}

/**
 * Clock-in for approved overtime
 */
export function useOvertimeClockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => overtimeService.clockIn(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      message.success('ลงเวลาเข้า OT สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถลงเวลาเข้า OT ได้');
    },
  });
}

interface ClockOutVariables {
  requestId: string;
  notes?: string;
}

/**
 * Clock-out for overtime
 */
export function useOvertimeClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, notes }: ClockOutVariables) =>
      overtimeService.clockOut(requestId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      message.success('ลงเวลาออก OT สำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถลงเวลาออก OT ได้');
    },
  });
}
