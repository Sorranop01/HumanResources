import { AuditOutlined, ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import { useState } from 'react';
import { useAuditLogs } from '../hooks/useAuditLogs';
import type { RBACAuditLog } from '../types/rbacTypes';

const { Title, Text } = Typography;

/**
 * Audit Logs page
 */
export const AuditLogsPage: FC = () => {
  const [limit, setLimit] = useState(100);
  const { data: logs, isLoading, isError, error, refetch } = useAuditLogs(limit);

  const getActionColor = (action: RBACAuditLog['action']): string => {
    const colorMap: Record<RBACAuditLog['action'], string> = {
      ROLE_ASSIGNED: 'blue',
      ROLE_REVOKED: 'orange',
      ROLE_CREATED: 'green',
      ROLE_UPDATED: 'cyan',
      ROLE_DELETED: 'red',
      PERMISSION_GRANTED: 'purple',
      PERMISSION_REVOKED: 'magenta',
      USER_CREATED: 'geekblue',
      USER_UPDATED: 'volcano',
      USER_DELETED: 'red',
    };
    return colorMap[action] || 'default';
  };

  const getActionLabel = (action: RBACAuditLog['action']): string => {
    const labelMap: Record<RBACAuditLog['action'], string> = {
      ROLE_ASSIGNED: 'กำหนดบทบาท',
      ROLE_REVOKED: 'ยกเลิกบทบาท',
      ROLE_CREATED: 'สร้างบทบาท',
      ROLE_UPDATED: 'แก้ไขบทบาท',
      ROLE_DELETED: 'ลบบทบาท',
      PERMISSION_GRANTED: 'ให้สิทธิ์',
      PERMISSION_REVOKED: 'ยกเลิกสิทธิ์',
      USER_CREATED: 'สร้างผู้ใช้',
      USER_UPDATED: 'แก้ไขผู้ใช้',
      USER_DELETED: 'ลบผู้ใช้',
    };
    return labelMap[action] || action;
  };

  const columns: ColumnsType<RBACAuditLog> = [
    {
      title: 'การดำเนินการ',
      dataIndex: 'action',
      key: 'action',
      render: (action: RBACAuditLog['action']) => (
        <Tag color={getActionColor(action)}>{getActionLabel(action)}</Tag>
      ),
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'metadata',
      key: 'metadata',
      render: (metadata?: Record<string, unknown>) => {
        if (!metadata) return '-';
        return (
          <div style={{ maxWidth: 400 }}>
            <Text style={{ fontSize: '13px' }}>{JSON.stringify(metadata)}</Text>
          </div>
        );
      },
    },
    {
      title: 'ผู้ดำเนินการ',
      dataIndex: 'performedBy',
      key: 'performedBy',
      render: (performedBy: string) => <Text>{performedBy}</Text>,
    },
    {
      title: 'ผู้ใช้ที่เกี่ยวข้อง',
      dataIndex: 'targetUserId',
      key: 'targetUserId',
      render: (targetUserId?: string) => <Text type="secondary">{targetUserId || '-'}</Text>,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip?: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {ip || '-'}
        </Text>
      ),
    },
    {
      title: 'เวลา',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: Date) =>
        new Date(date).toLocaleString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      sorter: (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      defaultSortOrder: 'ascend',
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
                <AuditOutlined /> ประวัติการใช้งาน
              </Title>
              <Text type="secondary">ติดตามและตรวจสอบการเปลี่ยนแปลงบทบาทและสิทธิ์ของผู้ใช้งาน</Text>
            </div>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              รีเฟรช
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <Space style={{ marginBottom: 16 }}>
          <Text>แสดง:</Text>
          <Select value={limit} onChange={setLimit} style={{ width: 150 }}>
            <Select.Option value={50}>50 รายการล่าสุด</Select.Option>
            <Select.Option value={100}>100 รายการล่าสุด</Select.Option>
            <Select.Option value={200}>200 รายการล่าสุด</Select.Option>
            <Select.Option value={500}>500 รายการล่าสุด</Select.Option>
          </Select>
        </Space>

        {/* Error Alert */}
        {isError && (
          <Alert
            message="เกิดข้อผิดพลาด"
            description={
              error instanceof Error ? error.message : 'ไม่สามารถโหลดประวัติการใช้งานได้ กรุณาลองใหม่อีกครั้ง'
            }
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Audit Logs Table */}
        <Table
          columns={columns}
          dataSource={logs || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};
