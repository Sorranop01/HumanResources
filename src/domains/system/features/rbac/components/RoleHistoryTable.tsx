/**
 * RoleHistoryTable Component
 * Display history of role assignments for a user
 */

import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import { ROLE_LABELS } from '@/shared/constants/roles';
import { useRoleHistoryAssignments } from '../hooks/useUserRoleManagement';
import type { UserRoleAssignment } from '../types/rbacTypes';

const { Text } = Typography;

interface RoleHistoryTableProps {
  userId: string;
}

/**
 * Table showing role assignment history for a user
 */
export const RoleHistoryTable: FC<RoleHistoryTableProps> = ({ userId }) => {
  const { data: assignments, isLoading } = useRoleHistoryAssignments(userId);

  const columns: ColumnsType<UserRoleAssignment> = [
    {
      title: 'บทบาท',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const colors: Record<string, string> = {
          admin: 'red',
          hr: 'blue',
          manager: 'purple',
          employee: 'green',
          auditor: 'orange',
        };
        return (
          <Tag color={colors[role] || 'default'}>
            {ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: UserRoleAssignment) => {
        const isExpired = record.expiresAt && record.expiresAt < new Date();

        if (isExpired) {
          return (
            <Tag icon={<ClockCircleOutlined />} color="default">
              หมดอายุ
            </Tag>
          );
        }

        if (isActive) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              ใช้งานอยู่
            </Tag>
          );
        }

        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            ยกเลิกแล้ว
          </Tag>
        );
      },
    },
    {
      title: 'มอบหมายโดย',
      dataIndex: 'assignedBy',
      key: 'assignedBy',
      render: (assignedBy: string) => <Text>{assignedBy}</Text>,
    },
    {
      title: 'วันที่มอบหมาย',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) =>
        new Date(date).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      title: 'วันหมดอายุ',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date?: Date) => {
        if (!date) {
          return <Text type="secondary">ไม่กำหนด</Text>;
        }

        const isExpired = date < new Date();
        return (
          <Text type={isExpired ? 'danger' : 'secondary'}>
            {new Date(date).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        );
      },
    },
    {
      title: 'เหตุผล',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason?: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {reason || '-'}
        </Text>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={assignments || []}
      loading={isLoading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
        showTotal: (total) => `ทั้งหมด ${total} รายการ`,
      }}
      size="small"
    />
  );
};
