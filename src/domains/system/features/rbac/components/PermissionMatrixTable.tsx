import { EditOutlined, MinusCircleFilled } from '@ant-design/icons';
import { Button, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import type { Role } from '@/shared/constants/roles';
import type { RoleDefinition, RolePermission } from '../types/rbacTypes';
import type { Permission, Resource } from '../utils/checkPermission';

const RESOURCES: Resource[] = [
  'employees',
  'attendance',
  'leave-requests',
  'payroll',
  'settings',
  'users',
  'roles',
  'audit-logs',
];

const RESOURCE_LABELS: Record<Resource, string> = {
  employees: 'พนักงาน',
  attendance: 'เวลาทำงาน',
  'leave-requests': 'การลา',
  payroll: 'เงินเดือน',
  settings: 'การตั้งค่า',
  users: 'ผู้ใช้งาน',
  roles: 'บทบาท',
  'audit-logs': 'ประวัติการใช้งาน',
};

interface PermissionMatrixTableProps {
  roles: RoleDefinition[];
  rolePermissions: RolePermission[];
  loading?: boolean;
  onEditPermission: (role: Role, resource: Resource) => void;
}

interface ResourceRow {
  key: Resource;
  resource: Resource;
  resourceName: string;
}

/**
 * Permission Matrix Table Component
 * Displays permissions for all roles and resources in a matrix format
 */
export const PermissionMatrixTable: FC<PermissionMatrixTableProps> = ({
  roles,
  rolePermissions,
  loading,
  onEditPermission,
}) => {
  // Build a map of role -> resource -> permissions for quick lookup
  const permissionMap: Record<Role, Record<Resource, Permission[]>> = {};

  for (const rolePermission of rolePermissions) {
    if (!permissionMap[rolePermission.role]) {
      permissionMap[rolePermission.role] = {};
    }
    permissionMap[rolePermission.role][rolePermission.resource] = rolePermission.permissions;
  }

  // Render permissions as tags with context indicator
  const renderPermissions = (permissions: Permission[] | undefined): JSX.Element => {
    if (!permissions || permissions.length === 0) {
      return (
        <Tooltip title="ไม่มีสิทธิ์">
          <MinusCircleFilled style={{ color: '#d9d9d9' }} />
        </Tooltip>
      );
    }

    // Group permissions by base permission
    const grouped: Record<string, { own: boolean; all: boolean }> = {};

    for (const permission of permissions) {
      if (permission.includes(':')) {
        const [base, scope] = permission.split(':');
        if (!grouped[base]) {
          grouped[base] = { own: false, all: false };
        }
        if (scope === 'own') {
          grouped[base].own = true;
        } else if (scope === 'all') {
          grouped[base].all = true;
        }
      } else {
        // No context means 'all'
        if (!grouped[permission]) {
          grouped[permission] = { own: false, all: false };
        }
        grouped[permission].all = true;
      }
    }

    return (
      <Space size={[4, 4]} wrap>
        {Object.entries(grouped).map(([base, scopes]) => {
          let label = base.charAt(0).toUpperCase();
          let tooltip = base;
          let color = 'blue';

          // Determine color based on permission type
          if (base === 'read') color = 'blue';
          else if (base === 'create') color = 'green';
          else if (base === 'update') color = 'orange';
          else if (base === 'delete') color = 'red';

          // Add scope indicator
          if (scopes.all) {
            tooltip = `${base}:all (ทั้งหมด)`;
          } else if (scopes.own) {
            label = `${label}*`;
            tooltip = `${base}:own (เฉพาะของตัวเอง)`;
            color = 'default';
          }

          return (
            <Tooltip key={base} title={tooltip}>
              <Tag color={color} style={{ margin: 0 }}>
                {label}
              </Tag>
            </Tooltip>
          );
        })}
      </Space>
    );
  };

  // Build columns: resource name + one column per role
  const columns: ColumnsType<ResourceRow> = [
    {
      title: 'ทรัพยากร',
      dataIndex: 'resourceName',
      key: 'resource',
      fixed: 'left',
      width: 150,
      render: (name: string) => <strong>{name}</strong>,
    },
    ...roles
      .filter((role) => role.isActive)
      .map((role) => ({
        title: role.name,
        key: role.role,
        width: 180,
        align: 'center' as const,
        render: (_: unknown, record: ResourceRow) => {
          const permissions = permissionMap[role.role]?.[record.resource];
          return (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              {renderPermissions(permissions)}
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEditPermission(role.role, record.resource)}
              >
                แก้ไข
              </Button>
            </Space>
          );
        },
      })),
  ];

  // Build data source (one row per resource)
  const dataSource: ResourceRow[] = RESOURCES.map((resource) => ({
    key: resource,
    resource,
    resourceName: RESOURCE_LABELS[resource],
  }));

  return (
    <div>
      {/* Legend */}
      <div style={{ marginBottom: 16 }}>
        <Space size="large">
          <Space>
            <strong>คำอธิบาย:</strong>
          </Space>
          <Space size={8}>
            <Tag color="blue">R</Tag>
            <span>Read</span>
          </Space>
          <Space size={8}>
            <Tag color="green">C</Tag>
            <span>Create</span>
          </Space>
          <Space size={8}>
            <Tag color="orange">U</Tag>
            <span>Update</span>
          </Space>
          <Space size={8}>
            <Tag color="red">D</Tag>
            <span>Delete</span>
          </Space>
          <Space size={8}>
            <Tag color="default">*</Tag>
            <span>เฉพาะของตัวเอง (own)</span>
          </Space>
        </Space>
      </div>

      {/* Permission Matrix Table */}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content' }}
        size="small"
        bordered
      />
    </div>
  );
};
