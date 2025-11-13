import { useQuery } from '@tanstack/react-query';
import { locationService } from '../services/locationService';
import type { LocationFilters } from '../types/locationTypes';

/**
 * Query keys for locations
 */
export const locationKeys = {
  all: ['locations'] as const,
  lists: () => [...locationKeys.all, 'list'] as const,
  list: (tenantId: string, filters?: LocationFilters) =>
    [...locationKeys.lists(), tenantId, filters] as const,
  details: () => [...locationKeys.all, 'detail'] as const,
  detail: (id: string) => [...locationKeys.details(), id] as const,
  byCode: (tenantId: string, code: string) =>
    [...locationKeys.all, 'code', tenantId, code] as const,
};

/**
 * Hook to fetch all locations
 */
export const useLocations = (tenantId: string, filters?: LocationFilters) => {
  return useQuery({
    queryKey: locationKeys.list(tenantId, filters),
    queryFn: () => locationService.getAll(tenantId, filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch location by ID
 */
export const useLocationById = (id: string) => {
  return useQuery({
    queryKey: locationKeys.detail(id),
    queryFn: () => locationService.getById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch location by code
 */
export const useLocationByCode = (tenantId: string, code: string) => {
  return useQuery({
    queryKey: locationKeys.byCode(tenantId, code),
    queryFn: () => locationService.getByCode(tenantId, code),
    enabled: !!tenantId && !!code,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
