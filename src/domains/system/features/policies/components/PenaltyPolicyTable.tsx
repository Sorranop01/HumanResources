/**
 * Penalty Policy Table
 * Table component for displaying and managing penalty policies
 */

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import { useDeletePenaltyPolicy, usePenaltyPolicies } from '../hooks/usePenaltyPolicies';
import type { PenaltyPolicy } from '../types/penaltyPolicy';

export const PenaltyPolicyTable: FC = () => {
  const { data: policies, isLoading } = usePenaltyPolicies({ isActive: true });
  const deleteMutation = useDeletePenaltyPolicy();

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบ Policy นี้?')) {
      deleteMutation.mutate(id);
    }
  };

  const getPenaltyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      late: 'มาสาย',
      absence: 'ขาดงาน',
      'early-leave': 'กลับก่อน',
      'no-clock-in': 'ไม่ลงเวลาเข้า',
      'no-clock-out': 'ไม่ลงเวลาออก',
      violation: 'ฝ่าฝืนกฎ',
    };
    return labels[type] || type;
  };

  const getCalculationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fixed: 'จำนวนคงที่',
      percentage: '% เงินเดือน',
      'hourly-rate': 'อัตราต่อชั่วโมง',
      'daily-rate': 'อัตราต่อวัน',
      progressive: 'ขั้นบันได',
    };
    return labels[type] || type;
  };

  const columns: ColumnsType<PenaltyPolicy> = [
    {
      title: 'รหัส',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <Tag color="red">{code}</Tag>,
    },
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <Tag>{getPenaltyTypeLabel(type)}</Tag>,
    },
    {
      title: 'วิธีคำนวณ',
      dataIndex: 'calculationType',
      key: 'calculationType',
      width: 140,
      render: (type: string) => getCalculationTypeLabel(type),
    },
    {
      title: 'จำนวน/อัตรา',
      key: 'value',
      width: 120,
      align: 'center',
      render: (_, record) => {
        if (record.amount) return `฿${record.amount}`;
        if (record.percentage) return `${record.percentage}%`;
        if (record.isProgressive) return 'ขั้นบันได';
        return '-';
      },
    },
    {
      title: 'Progressive',
      dataIndex: 'isProgressive',
      key: 'isProgressive',
      width: 100,
      align: 'center',
      render: (isProgressive: boolean) =>
        isProgressive ? <Tag color="orange">ใช่</Tag> : <Tag>ไม่</Tag>,
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
          <h3>กฎการปรับ (Penalty Policies)</h3>
          <p style={{ color: '#666', margin: 0 }}>กำหนดค่าปรับสำหรับการมาสาย ขาดงาน และฝ่าฝืนกฎ</p>
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
        scroll={{ x: 1200 }}
      />
    </div>
  );
};
