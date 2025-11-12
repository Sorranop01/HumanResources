/**
 * Overtime Policy Table
 * Table component for displaying and managing overtime policies
 */

import type { FC } from 'react';
import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { OvertimePolicy } from '../types/overtimePolicy';
import { useDeleteOvertimePolicy, useOvertimePolicies } from '../hooks/useOvertimePolicies';

export const OvertimePolicyTable: FC = () => {
  const { data: policies, isLoading } = useOvertimePolicies({ isActive: true });
  const deleteMutation = useDeleteOvertimePolicy();

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบ Policy นี้?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnsType<OvertimePolicy> = [
    {
      title: 'รหัส',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <Tag color="orange">{code}</Tag>,
    },
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'OT Rules',
      dataIndex: 'rules',
      key: 'rules',
      width: 180,
      render: (rules: any[]) => `${rules.length} กฎ`,
    },
    {
      title: 'Weekend Rate',
      dataIndex: 'weekendRate',
      key: 'weekendRate',
      width: 120,
      align: 'center',
      render: (rate: number) => `${rate}x`,
    },
    {
      title: 'Holiday Rate',
      dataIndex: 'holidayRate',
      key: 'holidayRate',
      width: 120,
      align: 'center',
      render: (rate: number) => `${rate}x`,
    },
    {
      title: 'Requires Approval',
      dataIndex: 'requiresApproval',
      key: 'requiresApproval',
      width: 130,
      align: 'center',
      render: (requires: boolean) =>
        requires ? <Tag color="gold">ต้อง Approve</Tag> : <Tag color="green">อัตโนมัติ</Tag>,
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive: boolean) =>
        isActive ? <Tag color="success">ใช้งาน</Tag> : <Tag color="default">ปิด</Tag>,
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} size="small">
            แก้ไข
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
            loading={deleteMutation.isPending}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3>นโยบาย OT (Overtime Policies)</h3>
          <p style={{ color: '#666', margin: 0 }}>กำหนด OT rate และเงื่อนไขการทำงานล่วงเวลา</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          เพิ่ม Policy
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={policies || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `ทั้งหมด ${total} รายการ`,
        }}
        scroll={{ x: 1100 }}
      />
    </div>
  );
};
