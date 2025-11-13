/**
 * Holiday Calendar Hooks
 * React Query hooks for holiday management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { holidayService } from '../services/holidayService';
import type {
  CreatePublicHolidayInput,
  PublicHolidayFilters,
  UpdatePublicHolidayInput,
  WorkingDaysCalculationInput,
} from '../types/holiday';

/**
 * Query keys for holidays
 */
export const holidayKeys = {
  all: ['holidays'] as const,
  lists: () => [...holidayKeys.all, 'list'] as const,
  list: (filters?: PublicHolidayFilters) => [...holidayKeys.lists(), filters] as const,
  details: () => [...holidayKeys.all, 'detail'] as const,
  detail: (id: string) => [...holidayKeys.details(), id] as const,
  byDate: (date: Date) => [...holidayKeys.all, 'date', date.toISOString()] as const,
  byYear: (year: number) => [...holidayKeys.all, 'year', year] as const,
  inRange: (startDate: Date, endDate: Date) =>
    [...holidayKeys.all, 'range', startDate.toISOString(), endDate.toISOString()] as const,
  isHoliday: (date: Date, location?: string, region?: string, department?: string) =>
    [...holidayKeys.all, 'check', date.toISOString(), location, region, department] as const,
  workingDays: (input: WorkingDaysCalculationInput) =>
    [...holidayKeys.all, 'workingDays', input] as const,
};

/**
 * Get all holidays
 */
export function useHolidays(filters?: PublicHolidayFilters) {
  return useQuery({
    queryKey: holidayKeys.list(filters),
    queryFn: () => holidayService.getAll(filters),
  });
}

/**
 * Get holiday by ID
 */
export function useHoliday(id: string | undefined) {
  return useQuery({
    queryKey: holidayKeys.detail(id || ''),
    queryFn: () => holidayService.getById(id || ''),
    enabled: !!id,
  });
}

/**
 * Get holidays by date
 */
export function useHolidaysByDate(date: Date) {
  return useQuery({
    queryKey: holidayKeys.byDate(date),
    queryFn: () => holidayService.getByDate(date),
  });
}

/**
 * Get holidays for a year
 */
export function useYearHolidays(year: number, filters?: PublicHolidayFilters) {
  return useQuery({
    queryKey: holidayKeys.byYear(year),
    queryFn: () => holidayService.getYearHolidays(year, filters),
  });
}

/**
 * Get holidays in date range
 */
export function useHolidaysInRange(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: holidayKeys.inRange(startDate, endDate),
    queryFn: () => holidayService.getHolidaysInRange(startDate, endDate),
  });
}

/**
 * Check if date is a holiday
 */
export function useIsHoliday(date: Date, location?: string, region?: string, department?: string) {
  return useQuery({
    queryKey: holidayKeys.isHoliday(date, location, region, department),
    queryFn: () => holidayService.isHoliday(date, location, region, department),
  });
}

/**
 * Calculate working days
 */
export function useWorkingDays(input: WorkingDaysCalculationInput) {
  return useQuery({
    queryKey: holidayKeys.workingDays(input),
    queryFn: () => holidayService.calculateWorkingDays(input),
  });
}

/**
 * Create holiday
 */
export function useCreateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePublicHolidayInput) => holidayService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.lists() });
      message.success('สร้างวันหยุดสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`สร้างวันหยุดไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Update holiday
 */
export function useUpdateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePublicHolidayInput }) =>
      holidayService.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.lists() });
      queryClient.invalidateQueries({ queryKey: holidayKeys.detail(variables.id) });
      message.success('แก้ไขวันหยุดสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`แก้ไขวันหยุดไม่สำเร็จ: ${error.message}`);
    },
  });
}

/**
 * Delete holiday
 */
export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => holidayService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.lists() });
      message.success('ลบวันหยุดสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`ลบวันหยุดไม่สำเร็จ: ${error.message}`);
    },
  });
}
