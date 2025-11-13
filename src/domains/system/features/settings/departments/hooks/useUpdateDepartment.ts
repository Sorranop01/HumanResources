import { useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '../services/departmentService';
import type { UpdateDepartmentInput } from '../types/departmentTypes';
import { departmentKeys } from './useDepartments';

type UpdateDepartmentParams = {
  id: string;
  input: UpdateDepartmentInput;
  userId: string;
};

/**
 * Hook to update a department
 */
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input, userId }: UpdateDepartmentParams) =>
      departmentService.update(id, input, userId),
    onSuccess: (_data, variables) => {
      // Invalidate specific department and lists
      queryClient.invalidateQueries({
        queryKey: departmentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.all,
      });
    },
    onError: (error) => {
      console.error('❌ Update department mutation failed:', error);
    },
  });
};
