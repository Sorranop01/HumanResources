/**
 * User Management Page
 * Main page for managing users and their role assignments
 */

import {
  PlusOutlined,
  ReloadOutlined,
  SafetyOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Modal, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import { useState } from 'react';
import { ROLE_LABELS } from '@/shared/constants/roles';
import type { User } from '@/shared/types';
import { AssignRoleModal } from '../../rbac/components/AssignRoleModal';
import { RoleHistoryTable } from '../../rbac/components/RoleHistoryTable';
import { UserRoleCard } from '../../rbac/components/UserRoleCard';
import { useEffectiveRole } from '../../rbac/hooks/useEffectiveRole';
import { CreateUserModal } from '../components/CreateUserModal';
import { useUsers } from '../hooks/useUsers';

const { Title, Text } = Typography;

/**
 * User Management Page
 */
export const UserManagementPage: FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: users, isLoading, isError, error, refetch } = useUsers();

  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ผู้ใช้',
      key: 'user',
      render: (_, record: User) => (
        <div>
          <div>
            <Text strong>{record.displayName}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'บทบาทเริ่มต้น',
      dataIndex: 'role',
      key: 'defaultRole',
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
            {ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}
          </Tag>
        );
      },
    },
    {
      title: 'บทบาทปัจจุบัน',
      key: 'effectiveRole',
      render: (_, record: User) => (
        <EffectiveRoleCell userId={record.id} defaultRole={record.role} />
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>{isActive ? 'ใช้งานอยู่' : 'ปิดการใช้งาน'}</Tag>
      ),
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) =>
        new Date(date).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      render: (_, record: User) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<UserOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            ดูรายละเอียด
          </Button>
          <Button
            type="link"
            size="small"
            icon={<SwapOutlined />}
            onClick={() => handleAssignRole(record)}
          >
            มอบหมายบทบาท
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Space
            style={{
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                <TeamOutlined /> จัดการผู้ใช้งาน
              </Title>
              <Text type="secondary">จัดการผู้ใช้งานและมอบหมายบทบาทในระบบ</Text>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                เพิ่มผู้ใช้
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                รีเฟรช
              </Button>
            </Space>
          </Space>
        </div>

        {/* Error Alert */}
        {isError && (
          <Alert
            message="เกิดข้อผิดพลาด"
            description={
              error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง'
            }
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Users Table */}
        <Table
          columns={columns}
          dataSource={users || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `ทั้งหมด ${total} ผู้ใช้`,
          }}
        />
      </Card>

      {/* Create User Modal */}
      <CreateUserModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      {/* Assign Role Modal */}
      <AssignRoleModal
        open={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        user={selectedUser}
      />

      {/* User Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined />
            <span>รายละเอียดผู้ใช้: {selectedUser?.displayName}</span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={900}
      >
        {selectedUser && (
          <div style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* User Role Card */}
              <UserRoleCard user={selectedUser} />

              {/* Role History */}
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SafetyOutlined />
                    <span>ประวัติการมอบหมายบทบาท</span>
                  </div>
                }
                size="small"
              >
                <RoleHistoryTable userId={selectedUser.id} />
              </Card>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

/**
 * Cell component to show effective role
 */
const EffectiveRoleCell: FC<{ userId: string; defaultRole: string }> = ({
  userId,
  defaultRole,
}) => {
  const { data: effectiveRoleInfo, isLoading } = useEffectiveRole(userId);

  if (isLoading) {
    return <Text type="secondary">กำลังโหลด...</Text>;
  }

  if (!effectiveRoleInfo) {
    return <Tag color="default">{ROLE_LABELS[defaultRole as keyof typeof ROLE_LABELS]}</Tag>;
  }

  const { effectiveRole, source } = effectiveRoleInfo;
  const isOverride = source === 'assignment';

  const colors: Record<string, string> = {
    admin: 'red',
    hr: 'blue',
    manager: 'purple',
    employee: 'green',
    auditor: 'orange',
  };

  return (
    <Space size={4}>
      <Tag color={colors[effectiveRole] || 'default'}>
        {ROLE_LABELS[effectiveRole as keyof typeof ROLE_LABELS] || effectiveRole}
      </Tag>
      {isOverride && (
        <Tag icon={<SwapOutlined />} color="blue">
          มอบหมาย
        </Tag>
      )}
    </Space>
  );
};
