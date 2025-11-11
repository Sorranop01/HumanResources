import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { Role } from '@/shared/constants/roles';
import { userManagementService } from '../services/userManagementService';
import type { CreateUserPayload, UpdateUserPayload } from '../types/user.types';

/**
 * Query keys for users
 */
export const userKeys = {
  all: ['users'] as const,
  list: (filters?: { role?: Role; isActive?: boolean }) =>
    [...userKeys.all, 'list', filters] as const,
};

/**
 * Hook to fetch all users
 */
export function useUsers(filters?: { role?: Role; isActive?: boolean }) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userManagementService.getUsers(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userManagementService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      message.success('สร้างผู้ใช้สำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Failed to create user:', error);
      const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถสร้างผู้ใช้ได้';
      message.error(`สร้างผู้ใช้ไม่สำเร็จ: ${errorMessage}`);
    },
  });
}

/**
 * Hook to update user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) =>
      userManagementService.updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      message.success('อัปเดตข้อมูลผู้ใช้สำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Failed to update user:', error);
      message.error('อัปเดตข้อมูลผู้ใช้ไม่สำเร็จ');
    },
  });
}

/**
 * Hook to deactivate user
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (userId: string) => userManagementService.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      message.success('ปิดการใช้งานผู้ใช้สำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Failed to deactivate user:', error);
      message.error('ปิดการใช้งานผู้ใช้ไม่สำเร็จ');
    },
  });
}

/**
 * Hook to activate user
 */
export function useActivateUser() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (userId: string) => userManagementService.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      message.success('เปิดการใช้งานผู้ใช้สำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Failed to activate user:', error);
      message.error('เปิดการใช้งานผู้ใช้ไม่สำเร็จ');
    },
  });
}
