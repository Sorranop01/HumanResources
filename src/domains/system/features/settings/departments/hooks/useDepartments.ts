import { useQuery } from '@tanstack/react-query';
import { departmentService } from '../services/departmentService';
import type { DepartmentFilters } from '../types/departmentTypes';

/**
 * Query keys for departments
 */
export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (tenantId: string, filters?: DepartmentFilters) =>
    [...departmentKeys.lists(), tenantId, filters] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
  byCode: (tenantId: string, code: string) =>
    [...departmentKeys.all, 'code', tenantId, code] as const,
  tree: (tenantId: string) => [...departmentKeys.all, 'tree', tenantId] as const,
};

/**
 * Hook to fetch all departments
 */
export const useDepartments = (tenantId: string, filters?: DepartmentFilters) => {
  return useQuery({
    queryKey: departmentKeys.list(tenantId, filters),
    queryFn: () => departmentService.getAll(tenantId, filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch department by ID
 */
export const useDepartmentById = (id: string) => {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentService.getById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch department by code
 */
export const useDepartmentByCode = (tenantId: string, code: string) => {
  return useQuery({
    queryKey: departmentKeys.byCode(tenantId, code),
    queryFn: () => departmentService.getByCode(tenantId, code),
    enabled: !!tenantId && !!code,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch department tree
 */
export const useDepartmentTree = (tenantId: string) => {
  return useQuery({
    queryKey: departmentKeys.tree(tenantId),
    queryFn: async () => {
      const departments = await departmentService.getAll(tenantId, {
        isActive: true,
      });
      return departmentService.buildTree(departments);
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
