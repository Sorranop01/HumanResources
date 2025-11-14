/**
 * Overtime Request Table
 * Tabular view of OT requests with optional action handlers
 */

import { Button, Space, Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { FC, ReactNode } from 'react';
import { OvertimeStatusBadge } from '@/domains/people/features/overtime/components/OvertimeStatusBadge';
import type { OvertimeRequest } from '@/domains/people/features/overtime/types';

const { Text } = Typography;

type RequestActionHandler = (request: OvertimeRequest) => void;

interface OvertimeRequestTableProps {
  data?: OvertimeRequest[];
  loading?: boolean;
  pagination?: boolean | { pageSize?: number };
  actionRender?: (request: OvertimeRequest) => ReactNode;
  onApprove?: RequestActionHandler;
  onReject?: RequestActionHandler;
  onCancel?: RequestActionHandler;
  onClockIn?: RequestActionHandler;
  onClockOut?: RequestActionHandler;
  actionLoadingId?: string | undefined;
}

export const OvertimeRequestTable: FC<OvertimeRequestTableProps> = ({
  data,
  loading,
  pagination: paginationProp = { pageSize: 10 },
  actionRender,
  onApprove,
  onReject,
  onCancel,
  onClockIn,
  onClockOut,
  actionLoadingId,
}) => {
  const tablePagination = paginationProp === true ? { pageSize: 10 } : paginationProp;

  const defaultActions = (request: OvertimeRequest): ReactNode => {
    if (actionRender) {
      return actionRender(request);
    }

    const isPending = request.status === 'pending';
    const isApproved = request.status === 'approved';
    const isClockedIn = request.clockStatus === 'clocked-in';
    const isCompleted = request.status === 'completed';

    return (
      <Space size="small" wrap>
        {onApprove && isPending && (
          <Button
            size="small"
            type="link"
            onClick={() => onApprove(request)}
            loading={actionLoadingId === request.id}
          >
            อนุมัติ
          </Button>
        )}
        {onReject && isPending && (
          <Button
            size="small"
            type="link"
            danger
            onClick={() => onReject(request)}
            loading={actionLoadingId === request.id}
          >
            ปฏิเสธ
          </Button>
        )}
        {onCancel && !isCompleted && (
          <Button
            size="small"
            type="link"
            onClick={() => onCancel(request)}
            loading={actionLoadingId === request.id}
          >
            ยกเลิก
          </Button>
        )}
        {onClockIn && isApproved && request.clockStatus === 'not-started' && (
          <Button
            size="small"
            type="link"
            onClick={() => onClockIn(request)}
            loading={actionLoadingId === request.id}
          >
            ลงเวลาเข้า
          </Button>
        )}
        {onClockOut && isClockedIn && (
          <Button
            size="small"
            type="link"
            onClick={() => onClockOut(request)}
            loading={actionLoadingId === request.id}
          >
            ลงเวลาออก
          </Button>
        )}
      </Space>
    );
  };

  const columns: ColumnsType<OvertimeRequest> = [
    {
      title: 'วันที่',
      dataIndex: 'overtimeDate',
      render: (date: Date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'พนักงาน',
      dataIndex: 'employeeName',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.employeeName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.departmentName} · {record.positionName}
          </Text>
        </Space>
      ),
    },
    {
      title: 'ช่วงเวลา',
      key: 'time-range',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>
            {record.plannedStartTime} - {record.plannedEndTime}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.plannedHours.toFixed(1)} ชั่วโมง
          </Text>
        </Space>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'overtimeType',
      render: (type: OvertimeRequest['overtimeType']) => (
        <Tag color="geekblue">{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      render: (_status: OvertimeRequest['status'], record) => (
        <OvertimeStatusBadge
          status={record.status}
          clockStatus={record.clockStatus}
          showClockStatus
        />
      ),
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'reason',
      ellipsis: true,
      render: (_: unknown, record) => (
        <Tooltip title={record.reason}>
          <Text>{record.reason}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      render: (_: unknown, record) => defaultActions(record),
    },
  ];

  return (
    <Table<OvertimeRequest>
      rowKey="id"
      dataSource={data}
      columns={columns}
      loading={loading}
      pagination={tablePagination}
    />
  );
};
