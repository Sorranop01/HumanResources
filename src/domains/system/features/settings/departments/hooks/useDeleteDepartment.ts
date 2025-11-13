import { useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '../services/departmentService';
import { departmentKeys } from './useDepartments';

type DeleteDepartmentParams = {
  id: string;
};

/**
 * Hook to delete a department
 */
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteDepartmentParams) => departmentService.delete(id),
    onSuccess: () => {
      // Invalidate all department queries
      queryClient.invalidateQueries({
        queryKey: departmentKeys.all,
      });
    },
    onError: (error) => {
      console.error('❌ Delete department mutation failed:', error);
    },
  });
};
