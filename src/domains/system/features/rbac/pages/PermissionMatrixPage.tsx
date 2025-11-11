import { ReloadOutlined, SafetyOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Space, Typography } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { EditPermissionModal } from '../components/EditPermissionModal';
import { PermissionMatrixTable } from '../components/PermissionMatrixTable';
import { useAllRolePermissions } from '../hooks/usePermissions';
import { useRoles } from '../hooks/useRoles';
import type { RolePermission } from '../types/rbacTypes';
import type { Resource } from '../utils/checkPermission';
import type { Role } from '@/shared/constants/roles';

const { Title, Text } = Typography;

/**
 * Permission Matrix Management Page
 * Shows and manages permission assignments for all roles
 */
export const PermissionMatrixPage: FC = () => {
  const [editModalState, setEditModalState] = useState<{
    open: boolean;
    role: Role | null;
    resource: Resource | null;
  }>({
    open: false,
    role: null,
    resource: null,
  });

  const { data: roles, isLoading: rolesLoading, refetch: refetchRoles } = useRoles();
  const {
    data: rolePermissions,
    isLoading: permissionsLoading,
    isError,
    error,
    refetch: refetchPermissions,
  } = useAllRolePermissions();

  const handleEditPermission = (role: Role, resource: Resource) => {
    setEditModalState({
      open: true,
      role,
      resource,
    });
  };

  const handleCloseModal = () => {
    setEditModalState({
      open: false,
      role: null,
      resource: null,
    });
  };

  const handleRefresh = () => {
    void refetchRoles();
    void refetchPermissions();
  };

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
                <SafetyOutlined /> Permission Matrix
              </Title>
              <Text type="secondary">
                จัดการสิทธิ์การเข้าถึงของแต่ละบทบาทในระบบ
              </Text>
            </div>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              รีเฟรช
            </Button>
          </Space>
        </div>

        {/* Error Alert */}
        {isError && (
          <Alert
            message="เกิดข้อผิดพลาด"
            description={
              error instanceof Error
                ? error.message
                : 'ไม่สามารถโหลดข้อมูล permissions ได้ กรุณาลองใหม่อีกครั้ง'
            }
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Permission Matrix Table */}
        <PermissionMatrixTable
          roles={roles || []}
          rolePermissions={rolePermissions || []}
          loading={rolesLoading || permissionsLoading}
          onEditPermission={handleEditPermission}
        />
      </Card>

      {/* Edit Permission Modal */}
      {editModalState.role && editModalState.resource && (
        <EditPermissionModal
          open={editModalState.open}
          role={editModalState.role}
          resource={editModalState.resource}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
