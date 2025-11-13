import { useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '../services/departmentService';
import type { CreateDepartmentInput } from '../types/departmentTypes';
import { departmentKeys } from './useDepartments';

type CreateDepartmentParams = {
  input: CreateDepartmentInput;
  userId: string;
};

/**
 * Hook to create a new department
 */
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, userId }: CreateDepartmentParams) =>
      departmentService.create(input, userId),
    onSuccess: (_data, variables) => {
      // Invalidate all department queries for this tenant
      queryClient.invalidateQueries({
        queryKey: departmentKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.tree(variables.input.tenantId),
      });
    },
    onError: (error) => {
      console.error('❌ Create department mutation failed:', error);
    },
  });
};
