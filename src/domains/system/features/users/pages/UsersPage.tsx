import { ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Select, Space, Typography } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { ROLE_LABELS, ROLES, type Role } from '@/shared/constants/roles';
import { UserTable } from '../components/UserTable';
import { useUsers } from '../hooks/useUsers';

const { Title } = Typography;

/**
 * Users management page
 */
export const UsersPage: FC = () => {
  const [roleFilter, setRoleFilter] = useState<Role | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);

  const filters = {
    ...(roleFilter && { role: roleFilter }),
    ...(statusFilter !== undefined && { isActive: statusFilter }),
  };

  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useUsers(Object.keys(filters).length > 0 ? filters : undefined);

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
                <UserOutlined /> จัดการผู้ใช้งาน
              </Title>
              <Typography.Text type="secondary">
                จัดการข้อมูลผู้ใช้งาน บทบาท และสถานะการใช้งาน
              </Typography.Text>
            </div>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              รีเฟรช
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="กรองตามบทบาท"
            style={{ width: 200 }}
            allowClear
            value={roleFilter}
            onChange={setRoleFilter}
          >
            <Select.Option value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]}</Select.Option>
            <Select.Option value={ROLES.HR}>{ROLE_LABELS[ROLES.HR]}</Select.Option>
            <Select.Option value={ROLES.MANAGER}>{ROLE_LABELS[ROLES.MANAGER]}</Select.Option>
            <Select.Option value={ROLES.EMPLOYEE}>{ROLE_LABELS[ROLES.EMPLOYEE]}</Select.Option>
            <Select.Option value={ROLES.AUDITOR}>{ROLE_LABELS[ROLES.AUDITOR]}</Select.Option>
          </Select>

          <Select
            placeholder="กรองตามสถานะ"
            style={{ width: 200 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Select.Option value={true}>ใช้งานอยู่</Select.Option>
            <Select.Option value={false}>ปิดการใช้งาน</Select.Option>
          </Select>
        </Space>

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
        <UserTable users={users || []} loading={isLoading} />
      </Card>
    </div>
  );
};
