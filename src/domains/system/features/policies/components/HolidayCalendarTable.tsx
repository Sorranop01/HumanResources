/**
 * Holiday Calendar Table
 * Table component for displaying and managing holidays
 */

import type { FC } from 'react';
import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { PublicHoliday } from '../types/holiday';
import { useDeleteHoliday, useYearHolidays } from '../hooks/useHolidays';
import dayjs from 'dayjs';

export const HolidayCalendarTable: FC = () => {
  const currentYear = new Date().getFullYear();
  const { data: holidays, isLoading } = useYearHolidays(currentYear);
  const deleteMutation = useDeleteHoliday();

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบวันหยุดนี้?')) {
      deleteMutation.mutate(id);
    }
  };

  const getHolidayTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      national: 'วันหยุดประจำชาติ',
      regional: 'วันหยุดภูมิภาค',
      company: 'วันหยุดบริษัท',
      substitute: 'วันหยุดชดเชย',
    };
    return labels[type] || type;
  };

  const columns: ColumnsType<PublicHoliday> = [
    {
      title: 'วันที่',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: Date) => dayjs(date).format('DD MMM YYYY'),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'ชื่อวันหยุด',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => {
        const colors: Record<string, string> = {
          national: 'red',
          regional: 'orange',
          company: 'blue',
          substitute: 'purple',
        };
        return <Tag color={colors[type] || 'default'}>{getHolidayTypeLabel(type)}</Tag>;
      },
    },
    {
      title: 'OT Rate',
      dataIndex: 'overtimeRate',
      key: 'overtimeRate',
      width: 100,
      align: 'center',
      render: (rate: number) => `${rate}x`,
    },
    {
      title: 'วันทดแทน',
      dataIndex: 'isSubstituteDay',
      key: 'isSubstituteDay',
      width: 100,
      align: 'center',
      render: (isSubstitute: boolean) =>
        isSubstitute ? <Tag color="purple">ใช่</Tag> : <Tag>ไม่</Tag>,
    },
    {
      title: 'พื้นที่',
      dataIndex: 'locations',
      key: 'locations',
      width: 120,
      render: (locations: string[]) =>
        locations.length > 0 ? locations.join(', ') : <Tag color="green">ทั่วประเทศ</Tag>,
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
          <h3>ปฏิทินวันหยุด (Holiday Calendar)</h3>
          <p style={{ color: '#666', margin: 0 }}>
            จัดการวันหยุดนักขัตฤกษ์และวันหยุดบริษัท (ปี {currentYear})
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          เพิ่มวันหยุด
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={holidays || []}
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
