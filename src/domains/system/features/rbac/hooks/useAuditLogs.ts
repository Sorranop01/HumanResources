/**
 * Audit Log Hooks
 * TanStack Query hooks for RBAC audit log operations
 */

import { useQuery } from '@tanstack/react-query';
import type { Role } from '@/shared/constants/roles';
import * as auditLogService from '../services/auditLogService';
import type { RBACAuditLog } from '../types/rbacTypes';

// Query Keys
export const auditLogKeys = {
  all: ['auditLogs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  byUser: (userId: string) => [...auditLogKeys.all, 'user', userId] as const,
  byTargetUser: (targetUserId: string) =>
    [...auditLogKeys.all, 'targetUser', targetUserId] as const,
  byAction: (action: RBACAuditLog['action']) => [...auditLogKeys.all, 'action', action] as const,
  byRole: (role: Role) => [...auditLogKeys.all, 'role', role] as const,
  recent: (limit: number) => [...auditLogKeys.all, 'recent', limit] as const,
};

/**
 * Get all audit logs
 */
export function useAuditLogs(limitCount = 100) {
  return useQuery<RBACAuditLog[], Error>({
    queryKey: [...auditLogKeys.lists(), limitCount],
    queryFn: () => auditLogService.getAllAuditLogs(limitCount),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get audit logs by user
 */
export function useAuditLogsByUser(userId: string, limitCount = 50) {
  return useQuery<RBACAuditLog[], Error>({
    queryKey: [...auditLogKeys.byUser(userId), limitCount],
    queryFn: () => auditLogService.getAuditLogsByUser(userId, limitCount),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Get audit logs for target user
 */
export function useAuditLogsForTargetUser(targetUserId: string, limitCount = 50) {
  return useQuery<RBACAuditLog[], Error>({
    queryKey: [...auditLogKeys.byTargetUser(targetUserId), limitCount],
    queryFn: () => auditLogService.getAuditLogsForTargetUser(targetUserId, limitCount),
    enabled: !!targetUserId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Get audit logs by action
 */
export function useAuditLogsByAction(action: RBACAuditLog['action'], limitCount = 50) {
  return useQuery<RBACAuditLog[], Error>({
    queryKey: [...auditLogKeys.byAction(action), limitCount],
    queryFn: () => auditLogService.getAuditLogsByAction(action, limitCount),
    enabled: !!action,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Get audit logs by role
 */
export function useAuditLogsByRole(role: Role, limitCount = 50) {
  return useQuery<RBACAuditLog[], Error>({
    queryKey: [...auditLogKeys.byRole(role), limitCount],
    queryFn: () => auditLogService.getAuditLogsByRole(role, limitCount),
    enabled: !!role,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Get recent audit logs
 */
export function useRecentAuditLogs(limitCount = 20) {
  return useQuery<RBACAuditLog[], Error>({
    queryKey: auditLogKeys.recent(limitCount),
    queryFn: () => auditLogService.getRecentAuditLogs(limitCount),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });
}
