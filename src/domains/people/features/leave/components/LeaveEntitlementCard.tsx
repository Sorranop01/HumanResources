/**
 * Leave Entitlement Card Component
 * Displays employee leave entitlements summary
 */

import { Card, Empty, Progress, Spin, Table, Tag } from 'antd';
import type { FC } from 'react';
import { useLeaveEntitlements } from '../hooks/useLeaveEntitlements';
import type { LeaveEntitlement } from '../types';

interface LeaveEntitlementCardProps {
  employeeId: string;
  year?: number;
}

export const LeaveEntitlementCard: FC<LeaveEntitlementCardProps> = ({ employeeId, year }) => {
  const currentYear = year ?? new Date().getFullYear();
  const { data: entitlements, isLoading } = useLeaveEntitlements(employeeId, currentYear);

  if (isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!entitlements || entitlements.length === 0) {
    return (
      <Card>
        <Empty description="ยังไม่มีข้อมูลสิทธิ์การลา" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  const columns = [
    {
      title: 'ประเภทการลา',
      dataIndex: 'leaveTypeName',
      key: 'leaveTypeName',
      render: (text: string, record: LeaveEntitlement) => (
        <span>
          <span style={{ marginRight: 8, fontSize: '16px' }}>
            {record.leaveTypeCode === 'ANNUAL' && '🏖️'}
            {record.leaveTypeCode === 'SICK' && '🤒'}
            {record.leaveTypeCode === 'PERSONAL' && '👤'}
            {record.leaveTypeCode === 'MATERNITY' && '🤱'}
            {record.leaveTypeCode === 'PATERNITY' && '👨'}
            {record.leaveTypeCode === 'TRAINING' && '🎓'}
            {record.leaveTypeCode === 'UNPAID' && '⏸️'}
          </span>
          {text}
        </span>
      ),
    },
    {
      title: 'ทั้งหมด',
      dataIndex: 'totalEntitlement',
      key: 'totalEntitlement',
      width: 100,
      align: 'center' as const,
      render: (value: number) => `${value} วัน`,
    },
    {
      title: 'ใช้ไป',
      dataIndex: 'used',
      key: 'used',
      width: 100,
      align: 'center' as const,
      render: (value: number) => <Tag color="red">{value} วัน</Tag>,
    },
    {
      title: 'รออนุมัติ',
      dataIndex: 'pending',
      key: 'pending',
      width: 100,
      align: 'center' as const,
      render: (value: number) => (value > 0 ? <Tag color="orange">{value} วัน</Tag> : '-'),
    },
    {
      title: 'คงเหลือ',
      dataIndex: 'remaining',
      key: 'remaining',
      width: 100,
      align: 'center' as const,
      render: (value: number) => (
        <Tag color="green">
          <strong>{value} วัน</strong>
        </Tag>
      ),
    },
    {
      title: 'สถานะ',
      key: 'progress',
      width: 200,
      render: (_: unknown, record: LeaveEntitlement) => {
        const percent =
          record.totalEntitlement > 0
            ? Math.round((record.used / record.totalEntitlement) * 100)
            : 0;
        return (
          <Progress
            percent={percent}
            size="small"
            status={percent >= 80 ? 'exception' : 'normal'}
          />
        );
      },
    },
  ];

  return (
    <Card title={`สิทธิ์การลาปี ${currentYear}`}>
      <Table
        dataSource={entitlements}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="middle"
      />
    </Card>
  );
};
