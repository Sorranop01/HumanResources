/**
 * Shift Management Table
 * Table component for displaying and managing shifts
 */

import type { FC } from 'react';
import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { Shift } from '../types/shift';
import { useDeleteShift, useShifts } from '../hooks/useShifts';

export const ShiftManagementTable: FC = () => {
  const { data: shifts, isLoading } = useShifts({ isActive: true });
  const deleteMutation = useDeleteShift();

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบกะทำงานนี้?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnsType<Shift> = [
    {
      title: 'รหัสกะ',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code: string) => <Tag color="purple">{code}</Tag>,
    },
    {
      title: 'ชื่อกะ',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'เวลาทำงาน',
      key: 'time',
      width: 150,
      render: (_, record) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: 'ชั่วโมงทำงาน',
      dataIndex: 'workHours',
      key: 'workHours',
      width: 120,
      align: 'center',
      render: (hours: number) => `${hours} ชม.`,
    },
    {
      title: 'ค่าพิเศษกะ',
      dataIndex: 'premiumRate',
      key: 'premiumRate',
      width: 120,
      align: 'center',
      render: (rate: number) => (rate > 0 ? `+${(rate * 100).toFixed(0)}%` : '-'),
    },
    {
      title: 'Bonus',
      dataIndex: 'nightShiftBonus',
      key: 'nightShiftBonus',
      width: 100,
      align: 'center',
      render: (bonus: number) => (bonus > 0 ? `฿${bonus}` : '-'),
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
          <h3>กะทำงาน (Shift Management)</h3>
          <p style={{ color: '#666', margin: 0 }}>
            จัดการกะทำงาน (เช้า/บ่าย/ดึก) และมอบหมายพนักงาน
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          เพิ่มกะทำงาน
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={shifts || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `ทั้งหมด ${total} รายการ`,
        }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};
