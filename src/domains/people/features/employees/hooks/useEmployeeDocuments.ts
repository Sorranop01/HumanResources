/**
 * Hooks for employee document management
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  DeleteEmployeeDocumentInput,
  UploadEmployeeDocumentInput,
} from '@/domains/people/features/employees/services/employeeDocumentService';
import { employeeDocumentService } from '@/domains/people/features/employees/services/employeeDocumentService';
import { employeeKeys } from '@/domains/people/features/employees/services/employeeService';

export function useUploadEmployeeDocument(employeeId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadEmployeeDocumentInput) => employeeDocumentService.upload(input),
    onSuccess: () => {
      if (employeeId) {
        queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
      }
      message.success('อัปโหลดเอกสารเรียบร้อย');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถอัปโหลดเอกสารได้');
    },
  });
}

export function useDeleteEmployeeDocument(employeeId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteEmployeeDocumentInput) => employeeDocumentService.delete(input),
    onSuccess: () => {
      if (employeeId) {
        queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
      }
      message.success('ลบเอกสารเรียบร้อย');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถลบเอกสารได้');
    },
  });
}
