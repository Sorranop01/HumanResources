import { PlusOutlined, ReloadOutlined, SafetyOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import { useState } from 'react';
import { CreateRoleModal } from '../components/CreateRoleModal';
import { useRoles } from '../hooks/useRoles';
import type { RoleDefinition } from '../types/rbacTypes';

const { Title, Text } = Typography;

/**
 * Roles and Permissions management page
 */
export const RolesPage: FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: roles, isLoading, isError, error, refetch } = useRoles();

  const columns: ColumnsType<RoleDefinition> = [
    {
      title: 'บทบาท',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: RoleDefinition) => (
        <div>
          <div>
            <Text strong>{name}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'ประเภท',
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
        return <Tag color={colors[role] || 'default'}>{role.toUpperCase()}</Tag>;
      },
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
                <SafetyOutlined /> บทบาทและสิทธิ์
              </Title>
              <Text type="secondary">จัดการบทบาทและสิทธิ์การเข้าถึงของผู้ใช้งานในระบบ</Text>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                รีเฟรช
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                สร้างบทบาทใหม่
              </Button>
            </Space>
          </Space>
        </div>

        {/* Error Alert */}
        {isError && (
          <Alert
            message="เกิดข้อผิดพลาด"
            description={
              error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลบทบาทได้ กรุณาลองใหม่อีกครั้ง'
            }
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Roles Table */}
        <Table
          columns={columns}
          dataSource={roles || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
          }}
        />
      </Card>

      {/* Create Role Modal */}
      <CreateRoleModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};
