import { useQuery } from '@tanstack/react-query';
import { positionService } from '../services/positionService';
import type { PositionFilters } from '../types/positionTypes';

export const positionKeys = {
  all: ['positions'] as const,
  lists: () => [...positionKeys.all, 'list'] as const,
  list: (tenantId: string, filters?: PositionFilters) =>
    [...positionKeys.lists(), tenantId, filters] as const,
  details: () => [...positionKeys.all, 'detail'] as const,
  detail: (id: string) => [...positionKeys.details(), id] as const,
  byCode: (tenantId: string, code: string) =>
    [...positionKeys.all, 'code', tenantId, code] as const,
  byDepartment: (tenantId: string, departmentId: string) =>
    [...positionKeys.all, 'department', tenantId, departmentId] as const,
};

export const usePositions = (tenantId: string, filters?: PositionFilters) => {
  return useQuery({
    queryKey: positionKeys.list(tenantId, filters),
    queryFn: () => positionService.getAll(tenantId, filters),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePositionById = (id: string) => {
  return useQuery({
    queryKey: positionKeys.detail(id),
    queryFn: () => positionService.getById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePositionsByDepartment = (tenantId: string, departmentId: string) => {
  return useQuery({
    queryKey: positionKeys.byDepartment(tenantId, departmentId),
    queryFn: () =>
      positionService.getAll(tenantId, {
        departmentId,
        isActive: true,
      }),
    enabled: !!tenantId && !!departmentId,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
