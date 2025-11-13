/**
 * Overtime Calendar
 * Calendar visualization of OT requests
 */

import { Badge, Calendar, Card, Empty, Spin, Tooltip } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { FC } from 'react';
import type { OvertimeRequest } from '@/domains/people/features/overtime/types';

const statusColors: Record<OvertimeRequest['status'], string> = {
  pending: 'gold',
  approved: 'green',
  rejected: 'red',
  cancelled: 'default',
  completed: 'blue',
};

interface OvertimeCalendarProps {
  requests?: OvertimeRequest[];
  loading?: boolean;
  onSelectDate?: (value: Dayjs) => void;
}

export const OvertimeCalendar: FC<OvertimeCalendarProps> = ({
  requests,
  loading,
  onSelectDate,
}) => {
  const grouped = requests?.reduce<Record<string, OvertimeRequest[]>>((acc, request) => {
    const key = dayjs(request.overtimeDate).format('YYYY-MM-DD');
    acc[key] = acc[key] ? [...acc[key], request] : [request];
    return acc;
  }, {});

  const dateCellRender = (value: Dayjs) => {
    const key = value.format('YYYY-MM-DD');
    const items = grouped?.[key] ?? [];

    if (!items.length) {
      return null;
    }

    return (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.slice(0, 3).map((item) => (
          <li key={item.id} style={{ marginBottom: 4 }}>
            <Tooltip title={`${item.employeeName} (${item.reason})`}>
              <Badge
                color={statusColors[item.status]}
                text={`${item.employeeName} (${item.plannedStartTime})`}
              />
            </Tooltip>
          </li>
        ))}
        {items.length > 3 && <span style={{ fontSize: 11 }}>+{items.length - 3} รายการ</span>}
      </ul>
    );
  };

  if (loading) {
    return (
      <Card style={{ minHeight: 320 }}>
        <Spin />
      </Card>
    );
  }

  if (!requests?.length) {
    return (
      <Card style={{ minHeight: 320 }}>
        <Empty description="ยังไม่มีคำขอ OT" />
      </Card>
    );
  }

  return (
    <Card title="ปฏิทิน OT">
      <Calendar
        fullscreen={false}
        dateCellRender={dateCellRender}
        onSelect={(value) => onSelectDate?.(value)}
      />
    </Card>
  );
};
