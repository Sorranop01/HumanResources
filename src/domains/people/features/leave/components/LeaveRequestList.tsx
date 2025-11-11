/**
 * Leave Request List Component
 * Table component for displaying leave requests
 */

import { EyeOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useLeaveRequests } from '../hooks/useLeaveRequests';
import type { LeaveRequest, LeaveRequestFilters } from '../types';

interface LeaveRequestListProps {
  filters?: LeaveRequestFilters;
  onViewDetail?: (id: string) => void;
}

const statusConfig = {
  draft: { color: 'default', text: 'แบบร่าง' },
  pending: { color: 'warning', text: 'รออนุมัติ' },
  approved: { color: 'success', text: 'อนุมัติแล้ว' },
  rejected: { color: 'error', text: 'ปฏิเสธ' },
  cancelled: { color: 'default', text: 'ยกเลิกแล้ว' },
};

export const LeaveRequestList: FC<LeaveRequestListProps> = ({ filters, onViewDetail }) => {
  const { data: requests, isLoading } = useLeaveRequests(filters);

  const columns = [
    {
      title: 'เลขที่คำขอ',
      dataIndex: 'requestNumber',
      key: 'requestNumber',
      width: 150,
    },
    {
      title: 'พนักงาน',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (_: string, record: LeaveRequest) => (
        <div>
          <div>{record.employeeName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.employeeCode}</div>
        </div>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'leaveTypeName',
      key: 'leaveTypeName',
      width: 150,
    },
    {
      title: 'วันที่เริ่มลา',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: Date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'วันที่สิ้นสุด',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: Date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'จำนวนวัน',
      dataIndex: 'totalDays',
      key: 'totalDays',
      width: 100,
      align: 'center' as const,
      render: (days: number) => `${days} วัน`,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: keyof typeof statusConfig) => (
        <Tag color={statusConfig[status].color}>{statusConfig[status].text}</Tag>
      ),
    },
    {
      title: 'วันที่ยื่นคำขอ',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 150,
      render: (date?: Date) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: LeaveRequest) => (
        <Space>
          {onViewDetail && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewDetail(record.id)}
            >
              ดูรายละเอียด
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={requests}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `ทั้งหมด ${total} รายการ`,
      }}
      scroll={{ x: 1200 }}
    />
  );
};
